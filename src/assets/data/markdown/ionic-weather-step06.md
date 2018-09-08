# Lab: Use a Library

**Remember to start a new feature branch in git!!**

## Install the Library

It is often useful to use third party libraries. For this application, we will use a library of <a href="https://github.com/kensodemann/kws-weather-widgets" target="_blank">weather related components</a> that I created and published on NPM. Many useful JavaScript libraries are availble via NPM and are available for use in your application.

To instatll my weathr component library: `npm install kws-weather-widgets`

The library is installed in `node_modules` and your `package.json` file is updated to reflect the new dependency:

```JSON
    "kws-weather-widgets": "0.0.9",
```

Commit your change: `git commit -am "feat(weather): add the weather component library"`

Remember to make intermediate commits with each step. We will squash and merge as usual in the end.

## Use the Library

Good libraries usually document exactly how to use the library in your application. In the case of this library, which is a web component library built using a technology called (Stencil)[https://stenciljs.com]. For Angular applications like yours, there are a couple of steps that need to be taken to use the library.

Since Angular does not know about the custom elements in the library, the `CUSTOM_ELEMENTS_SCHEMA` must be used. This tells the Angular compiler to ignore any elements it doesn't understand so long as they conform to the custom elements standard.

```TypeScript
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  Injectable,
  Injector,
  NgModule
} from '@angular/core';

...

@NgModule({
  ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

Second, there is a method in the library called `defineCustomElements()` that needs to be run. This is usually run in the `main.ts` file. This method contains the special suace that bundlers like WebPack need in order to be aware of the components. The end result being that WebPack will bundle them properly.

```TypeScript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from 'kws-weather-widgets';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
defineCustomElements(window);
```

## Create a Required Service

In order to allow each application to define its own weather condition images and where they exist, this library uses a specific map object. Let's just create that as a service (which were called "providers" in Ionic v3 for some reason) so it can easily be injected where needed.

`ionic generate provider icon-map`

If you do a `git status` at this point, you should see a new file was created for the service and that the `app.module.ts` file was changed.

```bash
~/Projects/Training/ionic-weather (feature/currentWeather *): git status
On branch feature/currentWeather
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   src/app/app.module.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        src/providers/

no changes added to commit (use "git add" and/or "git commit -a")
```

The `app.module.ts` file was modified to "provide" the `IconMapProvider` that we created.

```diff
~/Projects/Training/ionic-weather (feature/currentWeather *+): git diff src/app/app.module.ts
diff --git a/src/app/app.module.ts b/src/app/app.module.ts
index 0919a8a..712c368 100644
--- a/src/app/app.module.ts
+++ b/src/app/app.module.ts
@@ -18,6 +18,7 @@ import { TabsPage } from '../pages/tabs/tabs';

 import { StatusBar } from '@ionic-native/status-bar';
 import { SplashScreen } from '@ionic-native/splash-screen';
+import { IconMapProvider } from '../providers/icon-map/icon-map';

 Pro.init('1ec81629', {
   appVersion: '0.0.1'
@@ -62,7 +63,8 @@ export class MyErrorHandler implements ErrorHandler {
     StatusBar,
     SplashScreen,
     IonicErrorHandler,
-    { provide: ErrorHandler, useClass: MyErrorHandler }
+    { provide: ErrorHandler, useClass: MyErrorHandler },
+    IconMapProvider
   ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
 })
```

The `src/providers/icon-map/icon-map.ts` file needs to be modified to look like this:

```TypeScript
import { Injectable } from '@angular/core';

@Injectable()
export class IconMapProvider {
  sunny = 'assets/images/sunny.png';
  cloudy = 'assets/images/cloudy.png';
  lightRain = 'assets/images/light-rain.png';
  shower = 'assets/images/shower.png';
  sunnyThunderStorm = 'assets/images/partial-tstorm.png';
  thunderStorm = 'assets/images/tstorm.png';
  fog = 'assets/images/fog.png';
  snow = 'assets/images/snow.png';
  unknown = 'assets/images/dunno.png';
}
```

Add the new file and commit these changes:

- `git add src/providers`
- `git commit -am "WIP - add icon map"`

## Perform Some Global Styling

This is just some style tweaking that will make each page look a little nicer. Since you want this to (mostly) be consistent within your application, use generic class names and style it at the global level. Add the following code to `app.scss`:

```scss
.primary-value {
  font-size: 36px;
}

.secondary-value {
  font-size: 24px;
}

.item-ios,
.item-md {
  padding-left: 0;
  background-color: #b9dbf7;
}

.item-inner {
  padding: 12px;
}
```

## Mock Up the Component Usage

Let's mock up how the components will be used in each page. This allows us to test out exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts.

### Weather Model

Let's create a weather model that is based on the common data used by the weather component library. Create a `src/models` folder with a `src/models/weather.ts` file.

```TypeScript
export interface Weather {
  temperature: number;
  condition: number;
  date?: Date;
}
```

### Current Weather

First, clean up the class for the page:

- the `NavController` is not being used, so let's get rid of it
- inject the `IconMapProvider`
- create a `Weather` object with data

```TypeScript
import { Component } from '@angular/core';

import { IconMapProvider } from '../../providers/icon-map/icon-map';
import { Weather } from '../../models/weather';

@Component({
  selector: 'page-current-weather',
  templateUrl: 'current-weather.html'
})
export class CurrentWeatherPage {
  currentWeather: Weather = {
    temperature: 302,
    condition: 200
  };

  constructor(public iconMap: IconMapProvider) {}
}
```

Use the component in the view.

```html
  <div class="information">
    <ion-label class="city">Madison</ion-label>
    <kws-temperature class="primary-value" scale="F" temperature="{{currentWeather?.temperature}}"></kws-temperature>
  </div>
  <kws-condition [condition]="currentWeather?.condition" [iconPaths]="iconMap"></kws-condition>
```

Do some page-specific styling.

- in general, we want to minimize the use of this
- `city` is specific to this page
- only change the bits that need to be changed (`primary-value`)
- `kws-condition` is a custom element that uses shadow DOM so a lot of its styling is handled via <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*" target="_blank">custom properties (aka: CSS variables)</a>.

```scss
page-current-weather {
  .city {
    font-size: 24px;
    font-weight: bold;
  }

  .primary-value {
    margin-top: 18px;
  }

  kws-condition {
    --kws-condition-image-height: 212px;
    --kws-condition-label-font-size: 24px;
  }
}
```

### Forecast

Each `kws-daily-forecast` element takes an array of `Weather` data for a given day. We want to show the current forecast for several days, so we will need an array of arrays. Create a `src/models/forecast.ts` file:

```TypeScript
import { Weather } from './weather';

export type Forecast = Array<Array<Weather>>;
```

At this point, set up some simple sample data (three days worth should be fine), mock of the UI, and style it.

**forcast.ts**

```TypeScript
import { Component } from '@angular/core';

import { Forecast } from '../../models/forecast';
import { IconMapProvider } from '../../providers/icon-map/icon-map';

@Component({
  selector: 'page-forecast',
  templateUrl: 'forecast.html'
})
export class ForecastPage {
  forecast: Forecast = [
    [
      {
        temperature: 300,
        condition: 200,
        date: new Date(2018, 8, 19)
      }
    ],
    [
      {
        temperature: 265,
        condition: 601,
        date: new Date(2018, 8, 20)
      }
    ],
    [
      {
        temperature: 293,
        condition: 800,
        date: new Date(2018, 8, 21)
      }
    ]
  ];

  constructor(public iconMap: IconMapProvider) {}
}
```

**forcast.html**

```html
<ion-header>
  <ion-navbar color="primary">
    <ion-title>
      Forecast
    </ion-title>
  </ion-navbar>
</ion-header>

<ion-content padding>
  <ion-list>
    <ion-item *ngFor="let f of forecast">
      <kws-daily-forecast scale="F" [forecasts]="f" [iconPaths]="iconMap"></kws-daily-forecast>
    </ion-item>
  </ion-list>
</ion-content>
```

**forcast.scss**

**Note:** remember to change the main element tag from `page-about` to `page-forecast`.

```scss
page-forecast {
  kws-daily-forecast {
    --kws-daily-forecast-display: flex;
    --kws-daily-forecast-date-font-size: larger;
    --kws-daily-forecast-description-font-size: large;
    --kws-daily-forecast-description-font-weight: bold;
    --kws-daily-forecast-description-padding-left: 24px;
    --kws-daily-forecast-image-height: 96px;
  }
}
```

### UV Index

The UV index page is a little more involved. We will have some text we display here that is defined in the page source.

**src/models/uv-index.ts**

```TypeScript
export interface UVIndex {
  value: number,
  riskLevel: number
}
```

**uv-index.ts**

```TypeScript
import { Component } from '@angular/core';

import { UVIndex } from '../../models/uv-index';

@Component({
  selector: 'page-uv-index',
  templateUrl: 'uv-index.html'
})
export class UVIndexPage {
  uvIndex: UVIndex = {
    value: 6.4,
    riskLevel: 3
  };

  advice: Array<string> = [
    'Wear sunglasses on bright days. If you burn easily, cover up and use broad spectrum SPF 30+ sunscreen. ' +
      'Bright surfaces, such as sand, water and snow, will increase UV exposure.',
    'Stay in the shade near midday when the sun is strongest. If outdoors, wear sun protective clothing, ' +
      'a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 hours, ' +
      'even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water and snow, will increase UV exposure.',
    'Reduce time in the sun between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, a wide-brimmed hat, ' +
      'and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 hours, even on cloudy days, ' +
      'and after swimming or sweating. Bright surfaces, such sand, water and snow, will increase UV exposure.',
    'Minimize sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, a wide-brimmed hat, ' +
      'and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 hours, even on cloudy days, and after ' +
      'swimming or sweating. Bright surfaces, such as sand, water and snow, will increase UV exposure.',
    'Try to avoid sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, a wide-brimmed hat, ' +
      'and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 hours, even on cloudy days, ' +
      'and after swimming or sweating. Bright surfaces, such as sand, water and snow, will increase UV exposure.'
  ];

  constructor() {}
}
```

**uv-index.html**

```html
<ion-header>
  <ion-navbar color="primary">
    <ion-title>
      UV Index
    </ion-title>
  </ion-navbar>
</ion-header>

<ion-content text-center padding>
  <kws-uv-index class="primary-value" [uvIndex]="uvIndex?.value"></kws-uv-index>
  <div class="description">
    {{advice[uvIndex?.riskLevel]}}
  </div>
</ion-content>
```

**uv-index.scss**

```scss
page-uv-index {
  .description {
    margin-top: 16px;
  }
}
```

## Finish Feature

At this point, the app should be fully mocked up. Do the usual squash and merge in git to close out the branch.
