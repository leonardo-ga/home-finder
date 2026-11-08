import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ElementRef, Injector, SimpleChange, runInInjectionContext } from '@angular/core';
import { PhotoSlideComponent } from '../src/app/shared/photo-slide.component';

class ImageStub {
  style = {};
  alt = '';
  removed = false;
  onload: (() => Promise<void>) | null = null;
  onerror: (() => void) | null = null;
  frames: Keyframe[][] = [];
  async decode() {}
  setAttribute() {}
  remove() {
    this.removed = true;
  }
  animate(frames: Keyframe[]) {
    this.frames.push(frames);
    return { finished: new Promise<void>(() => {}), cancel() {} };
  }
}

function fixture(reducedMotion = false) {
  const images: ImageStub[] = [];
  const visible: ImageStub[] = [];
  const host = {
    ownerDocument: {
      defaultView: { matchMedia: () => ({ matches: reducedMotion }) },
      createElement: () => {
        const image = new ImageStub();
        images.push(image);
        return image;
      },
    },
    appendChild: (image: ImageStub) => visible.push(image),
  };
  const injector = Injector.create({
    providers: [{ provide: ElementRef, useValue: new ElementRef(host) }],
  });
  const component = runInInjectionContext(injector, () => new PhotoSlideComponent());
  const select = (src: string) => {
    component.src = src;
    component.ngOnChanges({ src: new SimpleChange('', src, false) });
    return images.at(-1)!;
  };
  return { component, select, visible };
}

test('the outgoing image stays visible until the next photo loads, then both move horizontally', async () => {
  const { component, select, visible } = fixture();
  const first = select('first.jpg');
  await first.onload!();
  const next = select('next.jpg');
  assert.deepEqual(visible, [first]);
  component.direction = -1;
  await next.onload!();
  assert.deepEqual(next.frames[0], [
    { transform: 'translateX(-100%)' },
    { transform: 'translateX(0)' },
  ]);
  assert.deepEqual(first.frames[0], [
    { transform: 'translateX(0)' },
    { transform: 'translateX(100%)' },
  ]);
  component.ngOnDestroy();
});

test('rapid navigation cannot display a stale photo when its load completes late', async () => {
  const { component, select, visible } = fixture();
  const stale = select('stale.jpg');
  const staleLoad = stale.onload!;
  const latest = select('latest.jpg');
  await latest.onload!();
  await staleLoad();
  assert.deepEqual(visible, [latest]);
  component.ngOnDestroy();
});

test('reduced motion replaces the photo without animating and failures keep the current image', async () => {
  const { component, select } = fixture(true);
  const first = select('first.jpg');
  await first.onload!();
  const second = select('second.jpg');
  await second.onload!();
  assert.equal(first.removed, true);
  assert.equal(second.frames.length, 0);
  let errors = 0;
  component.imageError.subscribe(() => errors++);
  select('missing.jpg').onerror!();
  assert.equal(errors, 1);
  assert.equal(second.removed, false);
  component.ngOnDestroy();
});
