# Lab: User Preferences Step 2

The user preferences will be stored on the device using <a href="https://github.com/ionic-team/ionic-storage" target="_blank">Ionic Storage</a>, which encapsulates several local storage options. In this lab, we will:

* create a service to store and retrieve the data
* create a subject that will emit when data changes
* modify the user preferences dialog to store the data
* modify the pages to repond to the user preference data changing

## Create a Data Service

This service will just save and retrieve / cache the user preference data.

1. using the CLI, create a provider called `user-preferences`
1. add the `IonicStorageModule` to the list of `imports` in `app.module.ts` as per the documentation on GitHub
1. create methods to get and set the user preference data in the provider that was just created

Here is the full code to get and set the `useCelcius` preference:

```TypeScript
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';

@Injectable()
export class UserPreferencesProvider {
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

**Note:** we could have also used getters and setters here, but I think that makes the calling code look weird. `this.userPreferences.getUseCelcius().then(...)` vs `this.userPreferences.useCelcius.then(...)`. That is mitigated somewhat if you use `async/await` all the time in your code. The choice is totally up to you.

**Challenge:** create similar methods for the city.

## Refactor

At this point, it does not make much sense for the cities to be defined where they are. Let's do a couple of things:

1. move the `cities.ts` file in with the service (`git mv src/components/user-preferences/cities.ts src/providers/user-preferences/cities.ts`)
1. add a method to the service that returns the available cities, call it `availableCities()`
1. makes two changes to the `getCity()` method
   1. if there is a city stored in user preferences, look up the city by name in the cities array
   1. if there is no city stored in user preferences, return the "Current Location" city (cities[0]).

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

1. inject `UserPreferencesProvider` in the constructor of `UserPreferencesComponent`
1. set the properties (`cities`, `city`, and `useCelcius`) properties in an appropriate life-cycle event getting the data from the service
1. set the data and close the modal from the `save()`

## Use the Service in the Pages

In the `CurrentWeatherPage`:

1. inject the `UserPreferencesProvider`
1. add `cityName` and `scale` properties (both strings)
1. update the `ionViewDidEnter()` to get the data and set the properties

```TypeScript
  ionViewDidEnter() {
    this.userPreferences.getCity().then(c => this.cityName = c.name);
    this.userPreferences.getUseCelcius().then(u => { this.scale = u ? 'C' : 'F' });
    this.weather.current().subscribe(w => (this.currentWeather = w));
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

1. inject the `UserPreferencesProvider`
1. modify the `getCurrentLocation()` function to check the city from user preferences and either return that cities location or use geo-location via `this.location.current()`

**Hints:**

1. you need to change the code inside of the `Observable.fromPromise()`
1. promises can be chained
1. when promises are chained, the promise ulitmately resolves to whatever is returned by the inner-most `then()` callback.

Here is what you should have in the end:

```TypeScript
  private getCurrentLocation(): Observable<Location> {
    return Observable.fromPromise(
      this.userPreferences.getCity().then(c => {
        if (c.location) {
          return Promise.resolve(c.location);
        } else {
          return this.location.current();
        }
      }));
  }
```

## Respond to Changes in the User Preferences

In rxjs, the `Subject` is kind of like an Event Emitter. Set one up in the `UserPreferenceProvider`.

1. `import { Subject } from 'rxjs';`
1. instantiate a new `Subject` in the constructor
1. call the `Subject`'s `next()` method when you want to emit a value on it

Often, you will emit a value. In this case just emit nothing. Here is a synopsis of the changes:

```TypeScript
import { Subject } from 'rxjs';

import { City } from '../../models/city';
import { cities } from './cities';

@Injectable()
export class UserPreferencesProvider {

  ...

  changed: Subject<void>;

  constructor(private storage: Storage) {
    this.changed = new Subject();
  }

  ...

  async setUseCelcius(value: boolean): Promise<void> {
    await this.storage.ready();
    this._useCelcius = value;
    this.changed.next();
    this.storage.set(this.keys.useCelcius, value);
  }

  ...

  async setCity(city: City): Promise<void> {
    await this.storage.ready();
    this._city = cities.find(c => c.name === city.name) || cities[0];
    this.changed.next();
    this.storage.set(this.keys.city, city);
  }
```


To respond to the change, each page (current-weather, forecast, uv-index) should be changed as such:

* since we will get data when the view enters and when the user preferences data changes, put that logic in a private method called `getData()`
* when the view loads, subscribe to the changed subject
* when the subject fires, get the data
* when the view unloads, remove the subscription

The code should look something like this:

```TypeScript
export class CurrentWeatherPage {
  scale: string;
  cityName: string;
  currentWeather: Weather;

  private subscription: Subscription;

  constructor(
    public iconMap: IconMapProvider,
    private modal: ModalController,
    private userPreferences: UserPreferencesProvider,
    private weather: WeatherProvider
  ) {}

  ionViewDidLoad() {
    this.subscription = this.userPreferences.changed.subscribe(() =>
      this.getData()
    );
  }

  ionViewDidEnter() {
    this.getData();
  }

  ionViewWillUnload() {
    this.subscription.unsubscribe();
  }

  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
  }

  private getData() {
    this.userPreferences.getCity().then(c => (this.cityName = c.name));
    this.userPreferences.getUseCelcius().then(u => {
      this.scale = u ? 'C' : 'F';
    });
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }
}
```

Perform similar changes in the other two pages.