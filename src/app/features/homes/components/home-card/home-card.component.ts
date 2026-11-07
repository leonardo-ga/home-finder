import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Home } from '../../domain/home.model';
import { formatMoney } from '../../../../shared/money';

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
  @Output() selectHome = new EventEmitter<Home>();
  readonly money = formatMoney;
  photoFailed = false;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['h']) this.photoFailed = false;
  }
}
