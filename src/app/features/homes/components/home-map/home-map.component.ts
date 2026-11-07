import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Home } from '../../domain/home.model';
import { formatMoney } from '../../../../shared/money';

/** Leaflet lifecycle and rendering only. Selection belongs to the feature store. */
@Component({
  selector: 'app-home-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-map.component.html',
  styleUrl: './home-map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) homes: readonly Home[] = [];
  @Input() selectedId: string | null = null;
  @Input() visible = true;
  @Output() selectHome = new EventEmitter<string>();
  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<HTMLDivElement>;

  private map: L.Map | undefined;
  private readonly markers = L.layerGroup();
  private resizeObserver: ResizeObserver | undefined;
  readonly tileError = signal(false);

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.map = L.map(this.canvas.nativeElement, { zoomControl: false }).setView(
        [45.468, 9.19],
        13,
      );
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      tiles.on('tileerror', () =>
        this.zone.run(() => {
          this.tileError.set(true);
        }),
      );
      tiles.addTo(this.map);
      this.markers.addTo(this.map);
      this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
      this.resizeObserver.observe(this.canvas.nativeElement);
      this.renderMarkers();
      this.fit();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;
    this.zone.runOutsideAngular(() => {
      if (changes['homes'] || changes['selectedId']) this.renderMarkers();
      if (changes['selectedId'] && this.selectedId) {
        const home = this.homes.find((item) => item.id === this.selectedId);
        if (home) this.map?.flyTo([home.lat, home.lng], 14);
      }
      if (changes['visible'] && this.visible) this.map?.invalidateSize();
      // Initial data arrives asynchronously after the map has mounted.
      if (changes['homes'] && !changes['homes'].previousValue?.length && this.homes.length)
        this.fit();
    });
  }

  fit(): void {
    if (this.homes.length)
      this.map?.fitBounds(L.latLngBounds(this.homes.map((home) => L.latLng(home.lat, home.lng))), {
        padding: [55, 55],
        maxZoom: 14,
      });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.markers.clearLayers();
    this.map?.remove();
    this.map = undefined;
  }

  private renderMarkers(): void {
    this.markers.clearLayers();
    for (const home of this.homes) {
      const marker = L.marker([home.lat, home.lng], {
        icon: L.divIcon({
          className: `price-marker ${home.id === this.selectedId ? 'active' : ''}`,
          html: `<span>${formatMoney(home.price)}</span>`,
          iconSize: [85, 32],
          iconAnchor: [42, 16],
        }),
        title: home.title,
      });
      marker.on('click', () => this.zone.run(() => this.selectHome.emit(home.id)));
      marker.addTo(this.markers);
    }
  }
}
