import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HomeGalleryComponent } from '../src/app/features/homes/components/home-gallery/home-gallery.component';
import { CATALOGUE_HOMES } from '../src/app/features/homes/domain/home.catalogue';

test('all eight galleries contain every source photo, with immutable unique records', () => {
  assert.deepEqual(
    CATALOGUE_HOMES.map((home) => home.photos.length),
    [24, 21, 26, 37, 34, 9, 13, 10],
  );
  for (const home of CATALOGUE_HOMES) {
    assert.ok(Object.isFrozen(home.photos));
    assert.ok(home.photos.every(Object.isFrozen));
    assert.equal(new Set(home.photos.map((photo) => photo.url)).size, home.photos.length);
  }
});

test('gallery wraps in both directions and resets selection and image errors for another home', () => {
  const gallery = new HomeGalleryComponent();
  gallery.photos = CATALOGUE_HOMES[0]!.photos;
  gallery.select(-1);
  assert.equal(gallery.index(), 23);
  gallery.select(gallery.index() + 1);
  assert.equal(gallery.index(), 0);
  gallery.imageFailed(gallery.photos[0]!.url);
  assert.equal(gallery.failed().size, 1);
  gallery.photos = CATALOGUE_HOMES[1]!.photos;
  gallery.ngOnChanges();
  assert.equal(gallery.index(), 0);
  assert.equal(gallery.failed().size, 0);
});

test('gallery keyboard navigation handles arrows and endpoints while leaving Escape to the dialog', () => {
  const gallery = new HomeGalleryComponent();
  gallery.photos = CATALOGUE_HOMES[0]!.photos;
  let prevented = 0;
  const press = (key: string) =>
    gallery.keydown({
      key,
      preventDefault: () => prevented++,
      stopPropagation() {},
    });
  press('End');
  assert.equal(gallery.index(), 23);
  press('ArrowRight');
  assert.equal(gallery.index(), 0);
  press('ArrowLeft');
  assert.equal(gallery.index(), 23);
  press('Home');
  assert.equal(gallery.index(), 0);
  press('Escape');
  assert.equal(prevented, 4);
});
