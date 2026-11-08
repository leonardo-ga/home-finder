import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';

/** Keep the outgoing photo visible until the incoming one is decoded, then slide both. */
@Component({
  selector: 'app-photo-slide',
  standalone: true,
  template: '',
  styles: [
    ':host { display: block; position: relative; width: 100%; height: 100%; min-height: 0; overflow: hidden; }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoSlideComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) src = '';
  @Input() description = '';
  @Input() fit: 'cover' | 'contain' = 'contain';
  @Input() direction: 1 | -1 = 1;
  @Output() imageError = new EventEmitter<void>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private current?: HTMLImageElement;
  private outgoing?: HTMLImageElement;
  private pending?: HTMLImageElement;
  private animations: Animation[] = [];
  private generation = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['src']) return;
    const generation = ++this.generation;
    this.clearTransition();
    this.clearPending();
    const image = this.host.nativeElement.ownerDocument.createElement('img');
    this.pending = image;
    image.alt = this.description;
    image.draggable = false;
    image.referrerPolicy = 'no-referrer';
    image.decoding = 'async';
    Object.assign(image.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      objectFit: this.fit,
      pointerEvents: 'none',
    });
    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        /* Loaded images can still render if decode is unsupported. */
      }
      if (generation !== this.generation) return;
      this.pending = undefined;
      image.onload = image.onerror = null;
      this.show(image);
    };
    image.onerror = () => {
      if (generation !== this.generation) return;
      this.clearPending();
      this.imageError.emit();
    };
    image.src = this.src;
  }

  private show(image: HTMLImageElement): void {
    const host = this.host.nativeElement;
    const previous = this.current;
    this.current = image;
    host.appendChild(image);
    if (!previous) return;
    previous.alt = '';
    previous.setAttribute('aria-hidden', 'true');
    this.outgoing = previous;
    if (host.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.clearTransition();
      return;
    }
    const options: KeyframeAnimationOptions = {
      duration: 360,
      easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      fill: 'forwards',
    };
    this.animations = [
      image.animate(
        [{ transform: `translateX(${this.direction * 100}%)` }, { transform: 'translateX(0)' }],
        options,
      ),
      previous.animate(
        [{ transform: 'translateX(0)' }, { transform: `translateX(${-this.direction * 100}%)` }],
        options,
      ),
    ];
    void Promise.all(this.animations.map((animation) => animation.finished))
      .then(() => {
        if (this.current === image) this.clearTransition();
      })
      .catch(() => {
        /* A newer selection or destruction cancels the previous transition. */
      });
  }

  private clearTransition(): void {
    this.animations.forEach((animation) => animation.cancel());
    this.animations = [];
    this.outgoing?.remove();
    this.outgoing = undefined;
  }

  private clearPending(): void {
    if (this.pending) this.pending.onload = this.pending.onerror = null;
    this.pending = undefined;
  }

  ngOnDestroy(): void {
    this.generation++;
    this.clearPending();
    this.clearTransition();
  }
}
