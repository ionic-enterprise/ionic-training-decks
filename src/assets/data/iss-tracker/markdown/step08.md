# Current Location

## Overview

In this step, we will:

- check [https://whatwebcando.today]()https://whatwebcando.today) to see how well supported Geolocation is supported
- implement web API based geolocation and try running on a device
- use reverse geocoding to get the current address
- use a pipe to display the address in a nice manner
- add a waiting indicator

## Details

First let's check [https://whatwebcando.today](https://whatwebcando.today) and see how well Geolocation is supported. It appears that it is supported well enough in all current browsers, so let's try using the web API directly.

### Create a Provider

The first step is to create a location service: `ionic g provider location`

This provider will perform two tasks:

- currentPosition() - get the our current position
- address() - use [reverse geocoding](https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse) to get an approximate address for our location

Here is the code that gets the current location:

```ts
  currentPosition(): Promise<Position> {
    if ('geolocation' in navigator) {
      return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(p => {
          if (p.coords) {
            this.position.latitude = p.coords.latitude;
            this.position.longitude = p.coords.longitude;
          }
          resolve(this.position);
        });
      });
    } else {
      return Promise.resolve(this.defaultPosition);
    }
  }
```

The code that does the reverse geocoding is also fairly straightforward:

```ts
  address(position: Position): Promise<Address> {
    const latLng = new google.maps.LatLng(
      position.latitude,
      position.longitude
    );
    return new Promise(resolve => {
      this.geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(this.buildAddress(results[0].address_components));
        } else {
          resolve({ streetNumber: 'Unknown Address' });
        }
      });
    });
  }
```

But what is this: `this.buildAddress(results[0].address_components)`?

Rather than giving us a record for an address, Google gives us an array of fields that each have a value and an array of types that defined what the field means. This has a couple of disadvantages:

- it makes displaying the address more difficult
- the format could change, new types could be added, etc. making our code potentially fragile
- we could switch to a different service that returns the address in a completely different format

For these reasons, it makes sense for us to define our own interface and convert our data from Google's format to our own. In this way, if anything changes, we only have to change how our provider translates the data to our interface instead of changing a lot of other code throughout the system.

It is generally a good idea to build an abstraction layer like this between portions of your system, even if the abstraction layer is very thin. Here is the code for our abstraction:


```ts
  private buildAddress(fields): Address {
    return fields.reduce((acc, curr) => {
      const field = this.fieldName(curr.types);
      if (field) {
        acc[field] = curr.short_name;
      }
      return acc;
    }, {});
  }

  private fieldName(t: Array<string>): string {
    if (t.indexOf('street_number') > -1) {
      return 'streetNumber';
    }
    if (t.indexOf('route') > -1) {
      return 'street';
    }
    if (t.indexOf('locality') > -1) {
      return 'city';
    }
    if (t.indexOf('administrative_area_level_1') > -1) {
      return 'area';
    }
    if (t.indexOf('postal_code') > -1) {
      return 'postalCode';
    }
  }
```

### Displaying the Address

We want to display the data on the top of the list of passes so we know what location is associated with the list. We could just display each element and try to do some reasonable formatting in the view itself. Rather than do that, we will create a couple of pipes. Using a pipe to format the data has a couple of advantages:

- the markup is much cleaner
- they are very easily tested (when we have unit tests) 

For simplicity, we will create a single pipe that will take a parameter that specifies exactly what data is displayed: `ionic g pipe address`

Here is the code:

```ts
import { Pipe, PipeTransform } from '@angular/core';

import { Address } from '../../models/address';

@Pipe({
  name: 'address'
})
export class AddressPipe implements PipeTransform {
  transform(value: Address, format: string): string {
    if (!value) {
      return '';
    }

    switch (format) {
      case 'line1':
        return `${value.streetNumber}${
          value.streetNumber && value.street ? ' ' : ''
        }${value.street}`;

      case 'line2':
        let rtn = value.city;
        if (value.area) {
          rtn += rtn && ', '
          rtn += value.area;
        }
        if (value.postalCode) {
          rtn += rtn && ' '
          rtn += value.postalCode;
        }
        return rtn;

      default:
        return '';
    }
  }
}
```

Let's use the pipe in `passes.html`:

```html
    <ion-item>
      <div class="title">
        Address:
      </div>
      <div>
        {{this.address | address: 'line1'}}
      </div>
      <div>
        {{this.address | address: 'line2'}}
      </div>
    </ion-item>
```

**Note:** when we created the pipe, a pipe module was created. Be sure to import that module in the App module.

### Miscellaneous Cleanup

While we are using pipes to make things pretty, let's use the pre-defined [date pipe](https://angular.io/api/common/DatePipe) to make the pass data more readable.

```html
    <ion-item *ngFor="let pass of passes">
      {{pass.riseTime | date: 'EEE, MMM d, y, h:mm:ss a'}}
    </ion-item>
```

### And we Wait...

You will notice that it now takes a non-trivial amount of time to display the passes. This is mostly because of the time it takes to get the current location. We should provide the user with some kind of indication that the application is doing something. We will use the [LoadingController](https://ionicframework.com/docs/api/components/loading/LoadingController/) to provide this.

**page.ts**

```ts
import { Component } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { IssTrackingDataProvider } from '../../providers/iss-tracking-data/iss-tracking-data';
import { Address } from '../../models/address';
import { Pass } from '../../models/pass';
import { LocationProvider } from '../../providers/location/location';

@Component({
  selector: 'page-passes',
  templateUrl: 'passes.html'
})
export class PassesPage {
  address: Address;
  passes: Array<Pass>;

  constructor(
    private data: IssTrackingDataProvider,
    private loadingCtrl: LoadingController,
    private location: LocationProvider
  ) {}

  async ionViewDidEnter() {
    const loading = this.loadingCtrl.create({
      content: 'Loading passes for this location...'
    });
    loading.present();
    const position = await this.location.currentPosition();
    this.data
      .nextPasses(position)
      .subscribe(p => (this.passes = p));
    this.address = await this.location.address(position);
    loading.dismiss();
  }
}
```

**Note:** there is a bug in the above code. Do you see it? Look closely at the `ionViewDidEnter()` method. The call to `this.data.nextPasses()` is asynchronous and could take a really long time. This would result in the loading indicator being dismissed before the pass data came back.

It is certainly a problem, but it will not affect us right now because those calls are so fast. Still, we should think about how to fix that. We can discuss that at a later time. It is not currently causing an issue.
