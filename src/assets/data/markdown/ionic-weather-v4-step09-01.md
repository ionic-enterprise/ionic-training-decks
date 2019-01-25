# Completed Code for Lab: User Preferences Phase 1 

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `cities.ts`

```TypeScript
import { City } from '../models/city';

export let cities: Array<City> = [
  { name: 'Current Location' },
  {
    name: 'Chicago, IL',
    coordinate: { latitude: 41.878113, longitude: -87.629799 }
  },
  {
    name: 'Edmonton, AB',
    coordinate: { latitude: 53.544388, longitude: -113.490929 }
  },
  {
    name: 'London, UK',
    coordinate: { latitude: 51.507351, longitude: -0.127758 }
  },
  {
    name: 'Madison, WI',
    coordinate: { latitude: 43.073051, longitude: -89.40123 }
  },
  {
    name: 'Milwaukee, WI',
    coordinate: { latitude: 43.038902, longitude: -87.906471 }
  },
  {
    name: 'Orlando, FL',
    coordinate: { latitude: 28.538336, longitude: -81.379234 }
  },
  {
    name: 'Ottawa, ON',
    coordinate: { latitude: 45.42042, longitude: -75.69243 }
  }
];
```

## `user-preferences.component.html`

```html
<ion-header>
  <ion-toolbar color="primary">
    <ion-buttons slot="primary">
      <ion-button (click)="dismiss()">
        <ion-icon slot="icon-only" name="close"></ion-icon>
      </ion-button>
    </ion-buttons>
    <ion-title>User Preferences</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list>
    <ion-item>
      <ion-label>Use Celcius</ion-label>
      <ion-toggle [(ngModel)]="useCelcius"></ion-toggle>
    </ion-item>

    <ion-item>
      <ion-label>Location</ion-label>
      <ion-select [(ngModel)]="city">
        <ion-select-option *ngFor="let city of cities" [value]="city">{{
          city.name
        }}</ion-select-option>
      </ion-select>
    </ion-item>
  </ion-list>
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-button expand="block" color="secondary" (click)="save()"
      >Save</ion-button
    >
  </ion-toolbar>
</ion-footer>
```

## `user-preferences.component.ts`

```TypeScript
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { City } from '../models/city';
import { cities } from './cities';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {
  cities: Array<City> = cities;
  city: City = this.cities[0];
  useCelcius: boolean;

  constructor(private modal: ModalController) {}

  ngOnInit() {}

  dismiss() {
    this.modal.dismiss();
  }

  save() {
    console.log('save', this.city, this.useCelcius);
    this.modal.dismiss();
  }
}
```