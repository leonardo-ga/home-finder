import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Home, Destinations, TravelMode } from '../../domain/home.model';
import { formatMoney } from '../../../../shared/money';
import { googleMapsRoute } from '../../domain/commute';
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
  @Input({ required: true }) destinations!: Destinations;
  @Input({ required: true }) mode!: TravelMode;
  @Output() closeDetails = new EventEmitter<void>();
  @Output() configureDestinations = new EventEmitter<void>();
  @Output() editHome = new EventEmitter<Home>();
  @Output() deleteHome = new EventEmitter<Home>();
  readonly money = formatMoney;
  route(home: Home, destination: Destinations[number]) {
    return googleMapsRoute(home, destination, this.mode);
  }
}
