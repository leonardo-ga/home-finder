import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Home } from '../../domain/home.model';
import { formatMoney } from '../../../../shared/money';
@Component({
  selector: 'app-home-details',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-details.component.html',
  styleUrl: './home-details.component.css',
})
export class HomeDetailsComponent {
  @Input({ required: true }) h!: Home;
  @Output() closeDetails = new EventEmitter<void>();
  readonly money = formatMoney;
}
