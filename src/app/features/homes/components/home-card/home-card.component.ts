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

@Component({
  selector: 'app-home-card',
  standalone: true,
  imports: [CommonModule],
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
    if (changes['h']) this.photoFailed = false;
  }
}
