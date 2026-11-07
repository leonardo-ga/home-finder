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
import { CommuteSettings } from '../../domain/home.model';

@Component({
  selector: 'app-destinations-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogFocusDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './destinations-editor.component.html',
  styleUrl: './destinations-editor.component.css',
})
export class DestinationsEditorComponent implements OnChanges {
  @Input({ required: true }) settings!: CommuteSettings;
  @Input() saving = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() saveSettings = new EventEmitter<CommuteSettings>();
  draft!: CommuteSettings;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings']) this.draft = structuredClone(this.settings);
  }
}
