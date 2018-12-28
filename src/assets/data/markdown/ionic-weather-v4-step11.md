# Lab: User Preferences Phase 2

The user preferences will be stored on the device using <a href="https://github.com/ionic-team/ionic-storage" target="_blank">Ionic Storage</a>, which encapsulates several local storage options. In this lab, we will:

* Create a service to store and retrieve the data
* Create a subject that will emit when data changes
* Modify the user preferences dialog to store the data
* Modify the pages to respond to the user preference data changing

## Create a Data Service

This service will save and retrieve / cache the user preference data.

1. Using the CLI, create a service called `services/user-preferences/user-preferences`
1. Using NPM, install the `@ionic/storage` package as a dependency of our application
1. Add the `IonicStorageModule` to the list of `imports` in `app.module.ts` as per the documentation on GitHub
1. Create methods to get and set the user preference data in the service that was just created

Here is the full code to get and set the `useCelcius` preference:

```TypeScript
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private keys = {
    useCelcius: 'useCelcius',
    city: 'city'
  };
  private _useCelcius: boolean;

  constructor(private storage: Storage) {}

  async getUseCelcius(): Promise<boolean> {
    await this.storage.ready();
    if (this._useCelcius === undefined) {
      this._useCelcius = await this.storage.get(this.keys.useCelcius);
    }
    return this._useCelcius;
  }

  async setUseCelcius(value: boolean): Promise<void> {
    await this.storage.ready();
    this._useCelcius = value;
    this.storage.set(this.keys.useCelcius, value);
  }
}
```

**Challenge:** create similar methods for the city.

## Refactor

At this point, it does not make much sense for the cities to be defined where they are. Let's do a couple of things:

1. move the `cities.ts` file in with the service (`git mv src/app/user-preferences/cities.ts src/app/services/user-preferences/cities.ts`)
1. fix the path to the `City` model in the moved `cities.ts` file
1. add a method to the service that returns the available cities, call it `availableCities()`
1. makes two changes to the `getCity()` method
   1. if there is a city stored in user preferences, look up the city by name in the cities array
   1. if there is no city stored in user preferences, return the "Current Location" city (cities[0]).

Here is what the code for `getCity()` should look like when you are done (try to do it without peaking first):

```TypeScript
  async getCity(): Promise<City> {
    await this.storage.ready();
    if (this._city === undefined) {
      const city = await this.storage.get(this.keys.city);
      this._city = cities.find(c => c.name === (city && city.name)) || cities[0];
    }
    return this._city;
  }
```

**Note:** when you do the above, the `UserPreferencesComponent` will break. We will fix it in the next step.

## Use the Service in the Component

**Challenge:** this one is all on you, try to do it without looking at the completed code

1. inject `UserPreferencesServices` in the constructor of `UserPreferencesComponent`
1. set the properties (`cities`, `city`, and `useCelcius`) properties in an appropriate life-cycle event getting the data from the service
1. set the data before closing the modal from the `save()`

## Use the Service in the Pages

In the `CurrentWeatherPage`:

1. inject the `UserPreferencesService`
1. add `cityName` and `scale` properties (both strings)
1. update the `ionViewDidEnter()` to get the data and set the properties

**Example:**

```TypeScript
  async ionViewDidEnter() {
    const l = await this.loading.create({
      message: 'Loading...'
    });
    l.present();
    this.cityName = (await this.userPreferences.getCity()).name;
    this.scale = (await this.userPreferences.getUseCelcius()) ? 'C' : 'F';
    this.weather.current().subscribe(w => {
      this.currentWeather = w;
      l.dismiss();
    });
  }
```

In the view, bind the data:

```html
  <div class="information">
    <ion-label class="city">{{cityName}}</ion-label>
    <kws-temperature class="primary-value" [scale]="scale" temperature="{{currentWeather?.temperature}}"></kws-temperature>
  </div>
```

**Challenge:** do the same for the `ForecastPage`. You will only need to deal with the scale.

## Use the Service in the Weather Service

When gettng the current location, the user preferences need to be taken into account.

1. inject the `UserPreferencesService`
1. modify the `getCurrentLocation()` function to check the city from user preferences and either return that city's location or use geo-location via `this.location.current()`

**Hints:**

1. You need to change the code inside of the `from()`
1. Promises can be chained
1. When promises are chained, the promise ulitmately resolves to whatever is returned by the inner-most `then()` callback.

Here is what you should have in the end:

```TypeScript
  private getCurrentLocation(): Observable<Coordinate> {
    return from(
      this.userPreferences.getCity().then(city => {
        if (city && city.coordinate) {
          return Promise.resolve(city.coordinate);
        } else {
          return this.location.current();
        }
      })
    );
  }
```

You could also write this to use `async / await` if you want:

```TypeScript
  private getCurrentLocation(): Observable<Coordinate> {
    return from((async (): Promise<Coordinate> => {
      const city = await this.userPreferences.getCity();
      return (city && city.coordinate) || await this.location.current();
    })());
  }
```

## Respond to Changes in the User Preferences

In rxjs, the `Subject` is kind of like an Event Emitter. Set one up in the `UserPreferenceService`.

1. `import { Subject } from 'rxjs';`
1. create a public property on the class: 
1. Instantiate a new `Subject` in the constructor
1. Call the `Subject`'s `next()` method when new preferences are changed

Often, you will emit a value. In this case just emit nothing. Here is a synopsis of the changes:

```TypeScript
import { Subject } from 'rxjs';

import { City } from '../../models/city';
import { cities } from './cities';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {

  ...

  changed: Subject<void>;

  constructor(private storage: Storage) {
    this.changed = new Subject();
  }

  ...

  async setUseCelcius(value: boolean): Promise<void> {
    await this.storage.ready();
    this._useCelcius = value;
    await this.storage.set(this.keys.useCelcius, value);
    this.changed.next();
  }

  ...

  async setCity(city: City): Promise<void> {
    await this.storage.ready();
    this._city = cities.find(c => c.name === city.name) || cities[0];
    await this.storage.set(this.keys.city, city);
    this.changed.next();
  }
```


To respond to the change, each page (current-weather, forecast, uv-index) should be changed as such:

* Since we will get data when the view enters and when the user preferences data changes, put that logic in a private method called `getData()`
* When the view loads, subscribe to the changed subject
* When the subject fires, get the data
* When the view unloads, remove the subscription

The code should look something like this:

```TypeScript
export class CurrentWeatherPage implements {
  scale: string;
  cityName: string;
  currentWeather: Weather;

  private subscription: Subscription;

  constructor(
    public iconMap: IconMapService,
    private modal: ModalController,
    private userPreferences: UserPreferencesService,
    private weather: WeatherService
  ) {}

  ngOnInit() {
    this.subscription = this.userPreferences.changed.subscribe(() =>
      this.getData()
    );
  }

  ionViewDidEnter() {
    this.getData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
  }

  private async getData() {
    const l = await this.loading.create({
      message: 'Loading...'
    });
    l.present();
    this.cityName = (await this.userPreferences.getCity()).name;
    this.scale = (await this.userPreferences.getUseCelcius()) ? 'C' : 'F';
    this.weather.current().subscribe(w => {
      this.currentWeather = w;
      l.dismiss();
    });
}
```

**Challenge:** perform similar changes in the other two pages.

## Conclusion

Our weather app now has a simple set of preferences and responds to changes to them.