# Add the Map

Our first page will eventually display a map showing the current location of the International Space Station. At the end of this step, the main page will display a map with a simple marker displaying a pre-defined location to show that the mapping is working.

## Overview

In this step, we will:

- Generate an API key
- Include the Google Maps APIs
- Draw the map
- Add a marker

This step introduces the idea of lifecycle events as well as the use of alternate styles depending on the platform (iOS or Android).

## Details

### Generating an API Key

In order to complete this step, you need to:

1. go to https://console.developers.google.com/apis/dashboard
1. enable the Google Maps Geocoding API
1. enable the Google Maps JavaScript API
1. go to https://console.developers.google.com/apis/credentials
1. generate an API key to use for this application

**Note:** The way we are using the API key in this demo is inherently insecure. In production code, you want to be more secure. Securing the key is beyond the scope of this lab.

**Note:** If you are doing this lab as part of an Ionic training course, we can supply a code for you to use. However, this API key will very likely be regenerated shortly after the course making the one we gave you invalid. At that point, if you want to continue using this lab you will need to generate your own key.

### Adding the Map

1. `npm i @types/googlemaps --save` - installs the google maps API TypeScript type definitions
1. update `index.html` to load the google apis script: `<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE"></script>` - add this to the end of the `<body>`.
1. update the Map page to display a map
   1. add a `<div>` to `map.html` to display the map
   1. style the `<div` such that the map displays at the proper size
   1. create the map after the view loads (use the `ionViewDidLoad` lifecycle event, see the [NavController](https://ionicframework.com/docs/api/navigation/NavController/) documentation for details

**map.html**
```html
<ion-header>
  <ion-navbar>
    <ion-title>Home</ion-title>
  </ion-navbar>
</ion-header>

<ion-content>
  <div id="iss-tracking-map"></div>
</ion-content>

```

**map.scss**
```scss
page-map {
  .content-md {
    #iss-tracking-map {
      height: calc(100vh - 112px);
    }
  }

  .content-ios {
    #iss-tracking-map {
      height: calc(100vh - 93px);
    }
  }
}
```

**map.ts**
```ts
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

declare var google: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  private map;
  private markers;

  constructor(private navCtrl: NavController) { }

  ionViewDidLoad() {
    this.createMap();
  }

  private createMap() {
    this.map = new google.maps.Map(
      document.getElementById('iss-tracking-map'),
      {
        center: new google.maps.LatLng(43.074237, -89.381012),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
    );
    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(43.074237, -89.381012),
      map: this.map,
      title: 'Ionic HQ',
      animation: google.maps.Animation.DROP
    });
  }
}
```
