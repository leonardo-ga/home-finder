import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  QueryList,
  ViewChildren,
  ViewChild,
  OnDestroy,
  signal,
} from '@angular/core';
import { HomePhoto } from '../../domain/home.model';
import { PhotoSlideComponent } from '../../../../shared/photo-slide.component';

@Component({
  selector: 'app-home-gallery',
  standalone: true,
  imports: [CommonModule, PhotoSlideComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-gallery.component.html',
  styleUrl: './home-gallery.component.css',
})
export class HomeGalleryComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) photos: readonly HomePhoto[] = [];
  @Input({ required: true }) title = '';
  readonly index = signal(0);
  readonly failed = signal<ReadonlySet<string>>(new Set());
  readonly fullscreen = signal(false);
  direction: 1 | -1 = 1;
  @ViewChild('viewer', { static: true }) private viewer!: ElementRef<HTMLDialogElement>;
  @ViewChild('expand') private expand?: ElementRef<HTMLButtonElement>;
  @ViewChildren('thumbnail') private thumbnails?: QueryList<ElementRef<HTMLButtonElement>>;
  private touchStart: { x: number; y: number } | null = null;

  openViewer(): void {
    this.fullscreen.set(true);
    this.viewer.nativeElement.showModal();
  }

  closeViewer(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.viewer.nativeElement.close();
    this.fullscreen.set(false);
    this.viewer.nativeElement.ownerDocument.defaultView?.requestAnimationFrame(() =>
      this.expand?.nativeElement.focus(),
    );
  }

  ngOnDestroy(): void {
    this.viewer.nativeElement.close();
  }

  cancelSwipe(): void {
    this.touchStart = null;
  }

  thumbnailFailed(event: Event): void {
    (event.target as HTMLImageElement).hidden = true;
  }

  ngOnChanges(): void {
    this.index.set(0);
    this.failed.set(new Set());
    this.touchStart = null;
  }

  select(index: number): void {
    if (!this.photos.length) return;
    this.direction = index < this.index() ? -1 : 1;
    this.index.set((index + this.photos.length) % this.photos.length);
    const thumbnail = this.thumbnails?.get(this.index())?.nativeElement;
    const strip = thumbnail?.parentElement;
    if (thumbnail && strip) {
      strip.scrollTo({
        left:
          thumbnail.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumbnail.offsetWidth) / 2,
      });
    }
  }

  keydown(event: Pick<KeyboardEvent, 'key' | 'preventDefault' | 'stopPropagation'>): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.select(this.index() - 1);
        break;
      case 'ArrowRight':
        this.select(this.index() + 1);
        break;
      case 'Home':
        this.select(0);
        break;
      case 'End':
        this.select(this.photos.length - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  startSwipe(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStart = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
  }

  endSwipe(event: TouchEvent): void {
    const start = this.touchStart;
    this.touchStart = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(touch.clientY - start.y))
      this.select(this.index() + (dx < 0 ? 1 : -1));
  }

  imageFailed(url: string): void {
    this.failed.update((urls) => new Set([...urls, url]));
  }

  trackPhoto(_index: number, photo: HomePhoto): string {
    return photo.url;
  }
}
