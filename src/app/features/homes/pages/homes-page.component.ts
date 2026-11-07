import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomesStore } from '../state/homes.store';
import { Home } from '../domain/home.model';
import { HomeCardComponent } from '../components/home-card/home-card.component';
import { HomeMapComponent } from '../components/home-map/home-map.component';
import { HomeDetailsComponent } from '../components/home-details/home-details.component';

@Component({
  selector: 'app-homes-page',
  standalone: true,
  imports: [CommonModule, HomeCardComponent, HomeMapComponent, HomeDetailsComponent],
  providers: [HomesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './homes-page.component.html',
  styleUrl: './homes-page.component.css',
})
export class HomesPageComponent {
  readonly store = inject(HomesStore);

  trackHome(_index: number, home: Home): string {
    return home.id;
  }

  @HostListener('document:keydown.escape')
  closeDetails(): void {
    this.store.select(null);
  }
}
