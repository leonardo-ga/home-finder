import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  ViewChild,
  ViewChildren,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomesStore } from '../state/homes.store';
import { Home } from '../domain/home.model';
import { HOME_SORT_CRITERIA } from '../domain/home.sort';
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
  readonly sortOptions = HOME_SORT_CRITERIA;
  detailsHome: Home | null = null;
  mapSelectionId: string | null = null;
  selectionAnnouncement = '';
  @ViewChildren(HomeCardComponent) private cards!: QueryList<HomeCardComponent>;
  @ViewChild(HomeMapComponent) private map!: HomeMapComponent;
  @ViewChild('cardList') private cardList!: ElementRef<HTMLElement>;

  trackHome(_index: number, home: Home): string {
    return home.id;
  }

  changeSort(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const option = this.sortOptions.find((option) => option.value === value);
    if (!option) return;
    this.store.setSortCriterion(option.value);
    this.sortChanged();
  }

  toggleSortDirection(): void {
    this.store.toggleSortDirection();
    this.sortChanged();
  }

  private sortChanged(): void {
    const label = this.sortOptions.find(
      (option) => option.value === this.store.sortCriterion(),
    )?.label;
    this.selectionAnnouncement =
      this.store.sortCriterion() === 'catalogue'
        ? 'Ordine del catalogo ripristinato.'
        : `Catalogo ordinato per ${label}, ordine ${this.store.sortDirection() === 'asc' ? 'crescente' : 'decrescente'}.`;
    const list = this.cardList.nativeElement;
    list.ownerDocument.defaultView?.requestAnimationFrame(() => {
      if (list.isConnected) list.scrollTop = 0;
    });
  }

  openDetails(home: Home): void {
    this.detailsHome = home;
  }

  selectFromMap(id: string): void {
    this.store.select(id);
    const home = this.store.activeHome();
    if (!home || home.id !== id) return;
    this.mapSelectionId = id;
    this.selectionAnnouncement = `Selezionato sulla mappa: ${home.title}. La scheda è visibile nel catalogo.`;
    this.revealSelected();
  }

  selectFromCard(home: Home): void {
    const alreadySelected = this.store.selectedId() === home.id;
    this.mapSelectionId = null;
    this.store.select(home.id);
    if (alreadySelected) this.map.focusHome(home.id);
    this.map.reveal();
  }

  private revealSelected(): void {
    this.cards.find((card) => card.h.id === this.store.selectedId())?.reveal();
  }

  closeDetails(): void {
    this.detailsHome = null;
  }
}
