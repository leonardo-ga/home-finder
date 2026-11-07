import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
} from '@angular/core';

/** Keeps keyboard focus in a modal and restores it when the modal closes. */
@Directive({ selector: '[appDialogFocus]', standalone: true })
export class DialogFocusDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly previousFocus = this.document.activeElement;

  ngAfterViewInit(): void {
    this.element.tabIndex = -1;
    this.element.focus();
  }

  @HostListener('keydown', ['$event'])
  trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const elements = Array.from(
      this.element.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
      ),
    ).filter((element) => !element.hidden && element.getClientRects().length > 0);
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    const focused = this.document.activeElement;
    if (event.shiftKey && (focused === first || focused === this.element)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (focused === last || focused === this.element)) {
      event.preventDefault();
      first.focus();
    }
  }

  ngOnDestroy(): void {
    if (this.previousFocus instanceof HTMLElement && this.previousFocus.isConnected)
      this.previousFocus.focus();
  }
}
