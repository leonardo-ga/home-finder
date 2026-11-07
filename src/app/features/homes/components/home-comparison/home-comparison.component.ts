import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Home } from '../../domain/home.model';
import { formatMoney } from '../../../../shared/money';

@Component({
  selector: 'app-home-comparison',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-comparison.component.html',
  styleUrl: './home-comparison.component.css',
})
export class HomeComparisonComponent {
  @Input({ required: true }) compared: readonly Home[] = [];
  @Output() back = new EventEmitter<void>();
  @Output() removeHome = new EventEmitter<string>();
  readonly money = formatMoney;
}
