import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomesPageComponent } from './features/homes/pages/homes-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomesPageComponent],
  template: '<app-homes-page />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
