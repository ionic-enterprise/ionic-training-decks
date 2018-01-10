# Displaying Data

Now that we are getting some data, let's display some of it on the pages

## Overview

In this step, we will:

- inject the data provider in the pages
- show the difference between `ionViewDidLoad` and `ionViewDidEnter` 
- load data when two of the views enter
- display the data in the list views
- adjust the data service due to issues that were found

## Details

### Injecting the Data Provider

First, we need to make the data provider available in the pages. This is done by injecting it using Angular's Dependency Injection. The provider was already made available for injection when we added it. This was done by listing it as a provider in `app.module.ts`. To inject the provider, include it in each page's constructor.

```ts
import { Component } from '@angular/core'; 
import { IssTrackingDataProvider } from '../../providers/iss-tracking-data/iss-tracking-data'; 
 
@Component({ 
  selector: 'page-passes', 
  templateUrl: 'passes.html' 
}) 
export class PassesPage { 
  constructor(private data: IssTrackingDataProvider) {} 
} 
```

### Lifecycle Events

Let's have a look at a couple of lifecycle events: `ionViewDidLoad` and `ionViewDidEnter`. To do this, add a method for each event each page such as below (not that `ionVewDidLoad` is already implemented in `map.ts`, just update that file):

```ts
import { Component } from '@angular/core'; 
import { IssTrackingDataProvider } from '../../providers/iss-tracking-data/iss-tracking-data'; 
 
@Component({ 
  selector: 'page-passes', 
  templateUrl: 'passes.html' 
}) 
export class PassesPage { 
  constructor(private data: IssTrackingDataProvider) {} 
 
  ionViewDidLoad() { 
    console.log('I have loaded the passes view'); 
  } 
 
  ionViewDidEnter() { 
    console.log('I have entered the passes view'); 
  } 
} 
```

If you run the application with the console open you will see that `ionViewDidLoad` is only called the first time you click on a tab where-as `ionViewDidEnter` is called each time. That is because the pages are cached and thus not loaded each time.

### Displaying the Data

In this step, we will display `pass` and `astronaut` data. Furthermore, we want to re-select the data each time the pages is entered. In order to do this, we will modify the `ionViewDidEnter` method to get the data. We will also remove the `ionViewDidLoad` method as it is not needed:

**astronauts.ts**
```ts
import { Component } from '@angular/core';
import { Astronaut } from '../../models/astronaut';
import { IssTrackingDataProvider } from '../../providers/iss-tracking-data/iss-tracking-data';
 
@Component({
  selector: 'page-astronauts',
  templateUrl: 'astronauts.html'
})
export class AstronautsPage {
  astronauts: Array<Astronaut>;
 
  constructor(private data: IssTrackingDataProvider) {}
 
  ionViewDidEnter() {
    this.data.astronauts().subscribe(a => this.astronauts = a);
  }
}
```

**passes.ts**
```ts
import { Component } from '@angular/core';
import { IssTrackingDataProvider } from '../../providers/iss-tracking-data/iss-tracking-data';
import { Pass } from '../../models/pass';
 
@Component({
  selector: 'page-passes',
  templateUrl: 'passes.html'
})
export class PassesPage {
  passes: Array<Pass>;
 
  constructor(private data: IssTrackingDataProvider) {}
 
  ionViewDidEnter() {
    this.data.nextPasses({ latitude: 43.074237, longitude: -89.381012 }).subscribe(p => this.passes = p);
  }
}
```

Once the data is obtained, we can display it on the page:

**astronauts.html**
```html
<ion-header>
  <ion-navbar>
    <ion-title>
      Astronauts
    </ion-title>
  </ion-navbar>
</ion-header>
 
<ion-content padding>
  <ion-list>
    <ion-item *ngFor="let astronaut of astronauts">
      {{astronaut.name}}
    </ion-item>
  </ion-list>
</ion-content>
```

**passes.html**
```html
<ion-header>
  <ion-navbar>
    <ion-title>
      Passes
    </ion-title>
  </ion-navbar>
</ion-header>
 
<ion-content padding>
  <ion-list>
    <ion-item *ngFor="let pass of passes">
      {{pass.riseTime}}
    </ion-item>
  </ion-list>
</ion-content>
```

### Fixing the Data Provider

When we update the `passes` page, we notice that nothing is displayed. Looking more closely at the data provider, we see the following issues:

- we are just unpacking the `response`, which has a `duration` property and a `risetime` property (note the lower case `t` where our model has `riseTime` with an upper case `T`)
- the `risetime` is the number of seconds since the epoch, not a Date, we want to display a date
- riseTime is defined as a number, not a Date in our model

Let's fix all of that.

First our model:

```ts
export interface Pass {
  duration: number;
  riseTime: Date;
}
```

Now let's transform the data properly in our data service:

```ts
  nextPasses(position: Position): Observable<Array<Pass>> {
    return this.http.jsonp(`${this.baseUrl}/iss-pass.json?lat=${position.latitude}&lon=${position.longitude}`, 'callback').pipe(
      map(res => {
        const data = (res as any).response.map(r => ({
          duration: r.duration,
          riseTime: new Date(r.risetime * 1000)
        }));
        return data;
      })
    );
  }
```

Key points here are:

- within the rxjs `map` operator, we use `Array.map` to map each element in the `response`
- the `risetime` is in seconds not milliseconds, so we need to multiply by 1000 before converting to a date

While we are in the code, let's also clean up `map.ts`:

- remove the lifecycle event test code we just added
- remove the code that calls and logs each method on the data provided (test code from the previous step)
- remove the injection of the nav controller
- change the name of the data provider from `tracking` to `data`
