# Creating a Provider

We need to get information about the International Space Station. We will get this information from some [Open Notify](http://open-notify.org/) feeds. We _could_ put this code directly in the pages that need it. However, in order to maintain proper separation of concerns, we _should_ put this code into a service that handles the data acquisition. Doing this makes our application more testable and maintainable.

## Overview

In this step, we will:

- Use the Ionic CLI to create an Ionic Provider (Angular Service)
- Use that provider to get data from http://open-notify.org/

## Details

### Create the Provider

First, let's generate the shell of a provider:

```bash
$ ionic g provider iss-tracking-data
```

This command creates a shell data provider called `IssTrackingDataProvider` in `src/providers/iss-tracking-data/iss-tracking-data.ts` and adds it to the `providers` list in `src/app/app.modult.ts`.

If we were to try an inject this provider right now, however, Angular would get angry with us, giving us an error such as:

```
  StaticInjectorError[HttpClient]: 
    NullInjectorError: No provider for HttpClient!
```

That is because our `IssTrackingDataProvider` depends on `HttpClient` and we are not importing that module anywhere. We have several choices:

1. create a module for our `IssTrackingDataProvider` and import `HttpClientModule` there, but this is not generally a good idea if we will have multiple data providers as they will all need `HttpClientModule` and we do not want to create multiple instances of the `HttpClient` service
1. create a module for all of our data related providers, import `HttpClientModule` there and then import/export all of our providers from that module. This is not a bad idea, and could work well.
1. add `HttpClientModule` to the `AppModule` - this is also a good option and one we will adopt here

**app.module.ts**
```ts
import { HttpClientModule } from '@angular/common/http';

...

@NgModule({
  declarations: [
    MyApp,
    AstronautsPage,
    MapPage,
    PassesPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
...

```

### Creating Models

It is a good idea to model the data we want to get from http://open-notify.org/ so we will create a `src/models` folder and add the following interfaces:

**astronaut.ts**
```ts
export interface Astronaut {
  craft: string;
  name: string;
}
```

**pass.ts**
```ts
export interface Pass {
  duration: number;
  riseTime: number;
}
```

**position.ts**
```ts
export interface Position {
  latitude: number;
  longitude: number;
}
```

### Getting the Data

Let's try this code for getting the data:

```ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { Astronaut } from '../../models/astronaut';
import { Pass } from '../../models/pass';
import { Position } from '../../models/position';

@Injectable()
export class IssTrackingDataProvider {
  private baseUrl = 'http://api.open-notify.org';

  constructor(private http: HttpClient) { }

  location(): Observable<Position> {
    return this.http.get(`${this.baseUrl}/iss-now.json`).pipe(
      map(res => (res as any).iss_position as Position)
    );
  }

  nextPasses(position: Position): Observable<Array<Pass>> {
    return this.http.get(`${this.baseUrl}/iss-pass.json?lat=${position.latitude}&lon=${position.longitude}`).pipe(
      map(res => (res as any).response as Array<Pass>)
    );
  }

  astronauts(): Observable<Array<Astronaut>> {
    return this.http.get(`${this.baseUrl}/astros.json`).pipe(
      map(res => (res as any).people as Array<Astronaut>)
    );
  }
}
```

Let's test this by adding the following code to `map.ts`:

```ts
import { IssTrackingDataProvider } from '../../providers/iss-tracking-data/iss-tracking-data';

declare var google: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  private map;
  private marker;

  constructor(private navCtrl: NavController, private tracking:IssTrackingDataProvider) {}

  ionViewDidLoad() {
    this.createMap();
    this.tracking.location().subscribe(x => console.log('location', x));
    this.tracking.astronauts().subscribe(x => console.log('astronauts', x));
    this.tracking.nextPasses({ latitude: 43, longitude: -89 }).subscribe(x => console.log('passes', x));
  }

...
```

If we look at the console, we see we have CORS issues with the `nextPasses()` call.


### Fixing the CORS Issues

Normally at this point, we would need to contact the developers who wrote our data service and work with them to get this resolved. In this case, however, we don't have that ability. 

To get around this, we will use a JSONP request for the passes data. In order to do this, we will need to:

1. add the `HttpClientJsonpModule` to `AppModule`
1. change the call from a `get()` to a `jsonp`, specifying the name of the callback parameter (which according to [the documentation for our data feed](http://open-notify.org/Open-Notify-API/ISS-Pass-Times/)) is `callback`

**app.module.ts**
```ts
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

...

  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    IonicModule.forRoot(MyApp)
  ],

...
```

**iss-tracking-data.ts**
```ts
  nextPasses(position: Position): Observable<Array<Pass>> {
    return this.http.jsonp(`${this.baseUrl}/iss-pass.json?lat=${position.latitude}&lon=${position.longitude}`, 'callback').pipe(
      map(res => (res as any).response as Array<Pass>)
    );
  }
```

Now all three routines return data.
