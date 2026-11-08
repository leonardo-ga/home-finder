import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Home } from '../../domain/home.model';
import { formatMoney } from '../../../../shared/money';
import { formatRentPerSquareMetre } from '../home.presentation';
import { PhotoSlideComponent } from '../../../../shared/photo-slide.component';

@Component({
  selector: 'app-home-card',
  standalone: true,
  imports: [CommonModule, PhotoSlideComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-card.component.html',
  styleUrl: './home-card.component.css',
})
export class HomeCardComponent implements OnChanges {
  @Input({ required: true }) h!: Home;
  @Input() index = 0;
  @Input() selected = false;
  @Input() selectedFromMap = false;
  @Output() selectHome = new EventEmitter<Home>();
  @Output() openDetails = new EventEmitter<Home>();
  readonly money = formatMoney;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly rentPerSquareMetre = formatRentPerSquareMetre;
  photoFailed = false;
  photoIndex = 0;
  photoDirection: 1 | -1 = 1;
  get photoUrl(): string {
    return this.h.photos[this.photoIndex]?.url || this.h.photo;
  }
  changePhoto(step: number): void {
    if (!this.h.photos.length) return;
    this.photoDirection = step < 0 ? -1 : 1;
    this.photoIndex = (this.photoIndex + step + this.h.photos.length) % this.h.photos.length;
    this.photoFailed = false;
  }
  reveal(): void {
    const reducedMotion = this.element.nativeElement.ownerDocument.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const element = this.element.nativeElement;
    element.ownerDocument.defaultView?.requestAnimationFrame(() => {
      if (element.isConnected)
        element.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['h']) {
      this.photoFailed = false;
      this.photoIndex = 0;
    }
  }
}
