import { Injectable } from '@angular/core';

/** IndexedDB adapter. It knows nothing about homes, forms or notifications. */
@Injectable({ providedIn: 'root' })
export class WorkspaceRepository {
  private connection: Promise<IDBDatabase> | undefined;

  async read(): Promise<unknown> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('settings', 'readonly');
      const request = transaction.objectStore('settings').get('data');
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error ?? new Error('Storage read aborted.'));
      transaction.onerror = () => reject(transaction.error ?? new Error('Storage read failed.'));
    });
  }

  async write(value: unknown): Promise<void> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('settings', 'readwrite');
      transaction.objectStore('settings').put(value, 'data');
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error ?? new Error('Storage write aborted.'));
      transaction.onerror = () => reject(transaction.error ?? new Error('Storage write failed.'));
    });
  }

  private open(): Promise<IDBDatabase> {
    if (!this.connection) {
      this.connection = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('home-finder', 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains('settings'))
            request.result.createObjectStore('settings');
        };
        request.onsuccess = () => {
          const database = request.result;
          database.onversionchange = () => {
            database.close();
            this.connection = undefined;
          };
          resolve(database);
        };
        request.onerror = () => reject(request.error ?? new Error('Storage unavailable.'));
        request.onblocked = () => reject(new Error('Storage upgrade blocked by another tab.'));
      }).catch((error) => {
        this.connection = undefined;
        throw error;
      });
    }
    return this.connection;
  }
}
