import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DialogFocusDirective } from '../../../../shared/dialog-focus.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Home, HOME_STATUSES } from '../../domain/home.model';

@Component({
  selector: 'app-home-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogFocusDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-editor.component.html',
  styleUrl: './home-editor.component.css',
})
export class HomeEditorComponent implements OnChanges {
  @Input({ required: true }) home!: Home;
  @Input() error = '';
  @Input() saving = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() saveHome = new EventEmitter<Home>();
  readonly statuses = HOME_STATUSES;
  h!: Home;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['home']) this.h = structuredClone(this.home);
  }
}
