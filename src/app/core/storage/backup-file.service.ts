import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BackupFileService {
  private readonly document = inject(DOCUMENT);

  download(text: string): void {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = 'home-finder-backup.json';
    anchor.click();
    // Allow the browser to consume the URL before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
