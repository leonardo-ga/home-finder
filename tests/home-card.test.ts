import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { HomeCardComponent } from '../src/app/features/homes/components/home-card/home-card.component';
import { CATALOGUE_HOMES } from '../src/app/features/homes/domain/home.catalogue';

test('browsing card photos wraps without selecting the map or opening details', () => {
  const injector = Injector.create({
    providers: [{ provide: ElementRef, useValue: new ElementRef({}) }],
  });
  const card = runInInjectionContext(injector, () => new HomeCardComponent());
  card.h = CATALOGUE_HOMES[0]!;
  let selections = 0;
  let details = 0;
  card.selectHome.subscribe(() => selections++);
  card.openDetails.subscribe(() => details++);
  card.photoFailed = true;
  card.changePhoto(-1);
  assert.equal(card.photoIndex, 23);
  assert.equal(card.photoUrl, card.h.photos[23]!.url);
  assert.equal(card.photoFailed, false);
  card.changePhoto(1);
  assert.equal(card.photoIndex, 0);
  assert.equal(selections, 0);
  assert.equal(details, 0);
});
