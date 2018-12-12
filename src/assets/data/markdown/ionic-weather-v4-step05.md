# Lab: Use a Library

In this lab, you will learn how to:

* Install third party libraries
* Integrate the third party libraries into your application
* Model the data required by your application
* Mock up the interface of your application

## Install the Library

It is often useful to use third party libraries. For this application, we will use a library of <a href="https://github.com/kensodemann/kws-weather-widgets" target="_blank">weather related components</a> that I created and published on NPM. Many useful JavaScript libraries are availble via NPM and are available for use in your application.

To install my weather component library, run: `npm install kws-weather-widgets`

The library is installed in `node_modules` and your `package.json` file is updated to reflect the new dependency:

```JSON
    "kws-weather-widgets": "1.0.0",
```

## Use the Library

Good libraries usually document exactly how to use the library in your application. In the case of this library - which is a web component library built using a technology called <a href="https://stenciljs.com" target="_blank">Stencil</a> - there are a couple of steps that need to be taken to use the library in an Angular project (like yours).

First, there is a method in the library called `defineCustomElements()` that needs to be run. This is usually run in the `main.ts` file. This method contains the special sauce that bundlers like WebPack need in order to be aware of the components, with the end result being that WebPack will bundle them properly.

```TypeScript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from 'kws-weather-widgets/dist/loader';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
defineCustomElements(window);
```

Second, since Angular does not know about the custom elements in the library, the `CUSTOM_ELEMENTS_SCHEMA` must be used in each module that uses any components from the library. This tells the Angular compiler to ignore any elements it doesn't understand so long as they conform to the custom elements standard.

For each of the three main pages in our library, we need to make a change similar to the following:

```TypeScript
...
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
...

@NgModule({
  ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CurrentWeatherPageModule {}k
```

## Create a Required Service

In order to allow each application to define its own weather condition images and where they exist, this library uses a specific map object. Let's just create that as a service so it can easily be injected where needed.

`ionic generate service services/icon-map/icon-map`

If you do a `git status` at this point, you should see a new file was created for the service:

```bash
~/Projects/Training/ionic-weather (master *): git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   package-lock.json
	modified:   package.json
	modified:   src/app/app.component.ts
	modified:   src/app/app.module.ts
	modified:   src/main.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	src/app/services/

no changes added to commit (use "git add" and/or "git commit -a")
```

The `src/services/icon-map/icon-map.service.ts` file needs to be modified to look like this:

```TypeScript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
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

## Install the Images

<a download href="/assets/images/images.zip">Download the images</a> and unpack the zip file under `src/assets`, creating an `images` folder with the images in them.

**Note:** the specifics on doing this depends on the type of machine you are using. On a Mac:

1. Drag and drop the `images.zip` from `Downloads` into `src/assets`
1. Double click the `images.zip` file in `src/assets`, which creates an `images` folder
1. Remove the `images.zip` file

## Mock Up the Component Usage

Let's mock up how the components will be used in each page. This allows us to test out exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts.

### Weather Model

Let's create a weather model that is based on the common data used by the weather component library. Create a `src/app/models` folder with a `src/app/models/weather.ts` file.

```TypeScript
export interface Weather {
  temperature: number;
  condition: number;
  date?: Date;
}
```

### Current Weather

- Inject the `IconMapProvider`
- Create a `Weather` object with data

```TypeScript
import { Component } from '@angular/core';

import { IconMapService } from '../services/icon-map/icon-map.service';
import { Weather } from '../models/weather';

@Component({
  selector: 'app-current-weather',
  templateUrl: 'current-weather.page.html',
  styleUrls: ['current-weather.page.scss']
})
export class CurrentWeatherPage {
  currentWeather: Weather = {
    temperature: 302,
    condition: 200
  };

  constructor(public iconMap: IconMapService) { }
}
```

Use the weather components in the view.

```html
<ion-content padding text-center>
  <div class="information">
    <div class="city">Madison</div>
    <kws-temperature
      class="primary-value"
      scale="F"
      temperature="{{currentWeather?.temperature}}"
    ></kws-temperature>
  </div>
  <kws-condition
    [condition]="currentWeather?.condition"
    [iconPaths]="iconMap"
  ></kws-condition>
</ion-content>
```

While we are in there, we should change the title for this page to be something more fitting. Let's say "Current Weather".

Now let's do some page-specific styling. In general, we want to minimize the use of this, but we have specific cases here where it makes sense:

- `city` is specific to this page
- We'd like `primary-value` to be smaller on this page (even though it's already defined globally)
- `kws-condition` is a custom element that uses shadow DOM so a lot of its styling is handled via <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*" target="_blank">custom properties (aka: CSS variables)</a>.

```scss
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
```

### Forecast

Each `kws-daily-forecast` element takes an array of `Weather` data for a given day. We want to show the current forecast for several days, so we will need an array of arrays. Create a `src/models/forecast.ts` file:

```TypeScript
import { Weather } from './weather';

export type Forecast = Array<Array<Weather>>;
```

At this point, set up some simple sample data (three days worth should be fine), mock up the UI, and style it.

**forecast.page.ts**

```TypeScript
import { Component } from '@angular/core';

import { Forecast } from '../models/forecast';
import { IconMapService } from '../services/icon-map/icon-map.service';

@Component({
  selector: 'app-forecast',
  templateUrl: 'forecast.page.html',
  styleUrls: ['forecast.page.scss']
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

  constructor(public iconMap: IconMapService) {}
}
```

**forecast.page.html**

```html
<ion-header>
  <ion-toolbar color="primary"> <ion-title> Forecast </ion-title> </ion-toolbar>
</ion-header>

<ion-content>
  <ion-content padding>
    <ion-list>
      <ion-item *ngFor="let f of forecast">
        <kws-daily-forecast
          scale="F"
          [forecasts]="f"
          [iconPaths]="iconMap"
        ></kws-daily-forecast>
      </ion-item>
    </ion-list>
  </ion-content>
</ion-content>
```

**forecast.scss**

**Note:** remember to change the main element tag from `page-about` to `page-forecast`.

```scss
kws-daily-forecast {
  --kws-daily-forecast-display: flex;
  --kws-daily-forecast-date-font-size: larger;
  --kws-daily-forecast-description-font-size: large;
  --kws-daily-forecast-description-font-weight: bold;
  --kws-daily-forecast-description-padding-left: 24px;
  --kws-daily-forecast-image-height: 96px;
}
```

### UV Index

The UV index page is a little more involved. We will have some text we display here that is defined in the page source.

**src/models/uv-index.ts**

```TypeScript
export interface UVIndex {
  value: number;
  riskLevel: number;
}
```
**uv-index.page.ts**

```TypeScript
import { Component } from '@angular/core';

import { UVIndex } from '../models/uv-index';

@Component({
  selector: 'app-uv-index',
  templateUrl: 'uv-index.page.html',
  styleUrls: ['uv-index.page.scss']
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

**uv-index.page.html**

```html
<ion-header>
  <ion-toolbar color="primary"> <ion-title>UV Index</ion-title> </ion-toolbar>
</ion-header>

<ion-content text-center padding>
  <kws-uv-index class="primary-value" [uvIndex]="uvIndex?.value"></kws-uv-index>
  <div class="description">{{ advice[(uvIndex?.riskLevel)] }}</div>
</ion-content>j
```

**uv-index.page.scss**

```scss
.description {
  margin-top: 16px;
}
```

## Conclusion 

In this lab, you learned how to include a third party component library as well as how to mock up the UI to ensure it looks the way you want it to look before moving on to getting actual data.
