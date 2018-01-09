# Step #6 - Where's the ISS? 
 
Right now the map is pretty much pinned to Ionic HQ. Let's change that so we can see where the International Space Station is right now. 
 
## Overview 

In this step, we will modify the map page to:

- get the current location of the International Space Station and create the map centered there
- update the map as the space station moves
 
## Details 

### Creating the Map

We are already creating the map when we load the view. Let's modify the `createMap()` method to take a position, and then pass in the current position of the space station. Here are the changes.

```ts
...
import { Position } from '../../models/position';
... 
  ionViewDidLoad() {
    this.data.location().subscribe(p => {
      this.createMap(p);
    });
  }
...
  private createMap(pos: Position) {
    this.map = new google.maps.Map(
      document.getElementById('iss-tracking-map'),
      {
        center: new google.maps.LatLng(pos.latitude, pos.longitude),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
    );
    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(pos.latitude, pos.longitude),
      map: this.map,
      animation: google.maps.Animation.DROP
    });
  }
}
```

#### Moving the Map

That's all well and good, but the space station moves (fast) and it would be nice to see it moving. Let's set up an interval to re-check the location and pan the map. Here are the changes to `map.ts`:

```ts
  private interval: number;
  ...
  ionViewDidEnter() { 
    this.interval = setInterval(() => { 
      this.data.location().subscribe(p => { 
        this.map.panTo(new google.maps.LatLng(p.latitude, p.longitude)); 
        this.marker.setPosition(new google.maps.LatLng(p.latitude, p.longitude)); 
      }); 
    }, 10000); 
  } 
 
  ionViewDidLeave() { 
    clearInterval(this.interval); 
  } 
```

So now on `ionViewDidLoad`, we create the map, and then on `ionViewDidEnter` we set up an interval to recheck the location every 10 seconds. We use the `ionViewDidLeave` lifecycle hook to clear the interval when we leave the page.

### Final Cleanup

That is all well and good, but we still have an issue. If we leave the page and then come back, we have to wait a full 10 seconds for a refresh. It would be nice if that happened right away.

To accomplish this, we will refactor the code such that it will either create or pan the map depending on whether or not a map currently exists. We will then only use the `ionViewDidEnter` hook to get data and draw the map. It can do that when we first enter the page and set up an interval to do it every 10 seconds after that. This means we no longer need the code in our `ionViewDidLoad` hook, so we will remove that. Here is the full code:

```ts
import { Component } from '@angular/core';

import { IssTrackingDataProvider } from '../../providers/iss-tracking-data/iss-tracking-data';
import { Position } from '../../models/position';

declare var google: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  private interval;
  private map;
  private marker;

  constructor(private data:IssTrackingDataProvider) {}

  ionViewDidEnter() {
    this.showLocation();
    this.interval = setInterval(this.showLocation.bind(this), 10000);
  }

  ionViewDidLeave() {
    clearInterval(this.interval);
  }

  private showLocation() {
    this.data.location().subscribe(p => {
      if (this.map) {
        this.moveMap(p);
      } else {
        this.createMap(p);
      }
    })
  }

  private createMap(pos: Position) {
    this.map = new google.maps.Map(
      document.getElementById('iss-tracking-map'),
      {
        center: new google.maps.LatLng(pos.latitude, pos.longitude),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
    );
    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(pos.latitude, pos.longitude),
      map: this.map,
      animation: google.maps.Animation.DROP
    });
  }

  private moveMap(pos: Position) {
    this.map.panTo(new google.maps.LatLng(pos.latitude, pos.longitude));
    this.marker.setPosition(new google.maps.LatLng(pos.latitude, pos.longitude));
  }
}
```

**Note:** when `this.showLocation` is passed to `setInterval` like that, the `this` pointer ends up being messed with. There are a couple of ways to deal with this. We chose to bind the proper "this" as such `this.interval = setInterval(this.showLocation.bind(this), 10000);` but that could have also been written as:

```ts
this.interval = setInterval(() => this.showLocation(), 10000);
```

Both are totally valid. Do whichever you like best.
