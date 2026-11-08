import { DOCUMENT, CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { Home } from '../../domain/home.model';
import { homeCosts } from '../../domain/home.costs';
import { formatMoney } from '../../../../shared/money';
import { formatRentPerSquareMetre } from '../home.presentation';
import { HomeGalleryComponent } from '../home-gallery/home-gallery.component';

@Component({
  selector: 'app-home-details',
  standalone: true,
  imports: [CommonModule, HomeGalleryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-details.component.html',
  styleUrl: './home-details.component.css',
})
export class HomeDetailsComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) h!: Home;
  @Output() closeDetails = new EventEmitter<void>();
  @ViewChild('dialog', { static: true }) private dialog!: ElementRef<HTMLDialogElement>;
  private readonly document = inject(DOCUMENT);
  private previousOverflow = '';
  readonly money = formatMoney;
  readonly rentPerSquareMetre = formatRentPerSquareMetre;
  get costs() {
    return homeCosts(this.h);
  }

  ngAfterViewInit(): void {
    this.previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.dialog.nativeElement.showModal();
  }
  cancel(event: Event): void {
    event.preventDefault();
    this.closeDetails.emit();
  }
  backdropClick(event: MouseEvent): void {
    if (event.target !== this.dialog.nativeElement) return;
    const bounds = this.dialog.nativeElement.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      this.closeDetails.emit();
  }
  ngOnDestroy(): void {
    this.dialog.nativeElement.close();
    this.document.body.style.overflow = this.previousOverflow;
  }
}
