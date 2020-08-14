# Lab: Mock Up the Interface

It is often desirable to lay out the user interface without worrying about how to get the data that will be displayed. This allows us to concentrate solely on how the application will look at feel, and to get that worked out early in the process.

In this lab, you will learn how to:

- Define some environment data
- Install assets that can be used by your application
- Model the data
- Mock up the user interface

## Change the Tabs

With the starter application, all of the page names, sources, and paths were modified to make more sense for our application, but the labels and icons were not. Let's fix that now.

Open the `tabs.page.html` file. Currently it looks like this:

```HTML
<ion-tabs>

  <ion-tab-bar slot="bottom" color="primary">
    <ion-tab-button tab="current-weather">
      <ion-icon name="flash"></ion-icon>
      <ion-label>Tab One</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="forecast">
      <ion-icon name="apps"></ion-icon>
      <ion-label>Tab Two</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="uv-index">
      <ion-icon name="send"></ion-icon>
      <ion-label>Tab Three</ion-label>
    </ion-tab-button>
  </ion-tab-bar>

</ion-tabs>
```

Change it such that the tabs use the following icons and labels:

- **Tab:** current-weather
  - **Icon:** cloud
  - **Label:** Current Weather
- **Tab:** forecast
  - **Icon:** calendar
  - **Label:** Forecast
- **Tab:** uv-index
  - **Icon:** sunny
  - **Label:** UV Index

## Define the Icon Asset Paths 

In order to allow each application to define its own weather condition images and where they exist, this library uses a specific map object. Let's just create that object in our `environment` files to make it readily available where needed.

Add an `icons` object to the `environment` object defined in `src/environments/environment.ts` and `src/environments/environment.prod.ts`. Here is an example:

```TypeScript
export const environment = {
  production: false,
  icons: {
    sunny: 'assets/images/sunny.png',
    cloudy: 'assets/images/cloudy.png',
    lightRain: 'assets/images/light-rain.png',
    shower: 'assets/images/shower.png',
    sunnyThunderStorm: 'assets/images/partial-tstorm.png',
    thunderStorm: 'assets/images/tstorm.png',
    fog: 'assets/images/fog.png',
    snow: 'assets/images/snow.png',
    unknown: 'assets/images/dunno.png',
  },
};
```

## Install the Images

The service we just created references several image assets, but these assets to do not exist yet. <a download href="/assets/images/images.zip">Download the images</a> and unpack the zip file under `src/assets`, creating an `images` folder with the images in them.

**Note:** the specifics on doing this depends on the type of machine you are using. On a Mac:

1. Drag and drop the `images.zip` from `Downloads` into `src/assets`
1. Double click the `images.zip` file in `src/assets`, which creates an `images` folder
1. Remove the `images.zip` file
1. Find the favicon.png file and move it into `src/assets/icon`

## Mock Up the Component Usage

Let's mock up how the components will be used in each page. This allows us to test out exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts. This is a common technique used when layout out the interface for an application.

### Weather Model

Create a weather model that is based on the common data used by the weather component library. Create a `src/app/models` folder with a `src/app/models/weather.ts` file.

```TypeScript
export interface Weather {
  temperature: number;
  condition: number;
  date?: Date;
}
```

### Path Mapping and Barrel Files

Before we get into the next section, let's make TypeScript module resolution a bit easier to deal with. If we don't do this, we could end up with a lot of code that looks like this:

```TypeScript
import { BarService } from '../../core/bar/bar.service';
import { FooService } from '../../core/foo/foo.service';
import { Weather } from '../../models/weather';
import { environment } from '../../../environments/environment';
```

The relative paths are obnoxious. They are also a maintenance headache as the application grows since you may need to adjust them as services and components are reorganized into different subdirectories over time. It would be better if our code could look like this:

```TypeScript
import { BarService, FooService } from '@app/core';
import { Weather } from '@app/models';
import { environment } from '@env/environment';
```

This can be achieved by creating TypeScript path mappings and by grouping like items into "barrel" files.

#### Path Mapping

Open the `tsconfig.json` file and add the following lines under the `baseUrl` setting:

```json
    "paths": {
      "@app/*": ["src/app/*"],
      "@env/*": ["src/environments/*"],
      "@test/*": ["test/*"]
    },
```

This tells TypeScript exactly which directory, relative to the `baseUrl`, to use when it finds one of the mappings in an `import` statement.

#### Barrel Files

We will group all of our models in a single `index.ts` file within the `models` folder. Similarily, we will group all of our services together via a similar file once we start creating services.

**`src/app/models/index.ts`**

```TypeScript
export * from './weather';
```

The files are very redundant right now, but as the app grows this will keep our import statements from getting out of hand.

### Current Weather

- Get the icon paths from the environment
- Create a `Weather` object with data

```TypeScript
import { Component } from '@angular/core';

import { environment } from '@env/environment';
import { Weather } from '@app/models';

@Component({
  selector: 'app-current-weather',
  templateUrl: 'current-weather.page.html',
  styleUrls: ['current-weather.page.scss'],
})
export class CurrentWeatherPage {
  icons = environment.icons;
  currentWeather: Weather = {
    temperature: 302,
    condition: 200,
  };

  constructor() {}
}
```

Use the weather components in the `src/app/current-weather/current-weather.page.html` view.

- Replace the contents of the `ion-content` element as shown
- Add the `ion-padding` and `ion-text-center` classes as shown

```html
<ion-content class="ion-padding ion-text-center" [fullscreen]="true">
  <div class="information">
    <kws-temperature class="primary-value" scale="F" temperature="{{currentWeather?.temperature}}"></kws-temperature>
  </div>
  <kws-condition [condition]="currentWeather?.condition" [iconPaths]="icons"></kws-condition>
</ion-content>
```

While we are in there, we should change the title for this page to be something more fitting. Let's say "Current Weather".

Now let's do some page-specific styling. In general, we want to minimize the use of this, but we have specific cases here where it makes sense:

- We'd like `primary-value` to be smaller on this page (even though it's already defined globally)
- `kws-condition` is a custom element that uses shadow DOM so a lot of its styling is handled via <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*" target="_blank">custom properties (aka: CSS variables)</a>.

```scss
.primary-value {
  margin-top: 18px;
}

kws-condition {
  --kws-condition-image-height: 212px;
  --kws-condition-label-font-size: 24px;
}
```

### Forecast

Each `kws-daily-forecast` element takes an array of `Weather` data for a given day. We want to show the current forecast for several days, so we will need an array of arrays. Create a `src/app/models/forecast.ts` file. **Remember to add it to the barrel file as well.**

```TypeScript
import { Weather } from './weather';

export type Forecast = Array<Array<Weather>>;
```

At this point, set up some simple sample data (three days worth should be fine), mock up the UI, and style it.

**forecast.page.ts**

```TypeScript
import { Component } from '@angular/core';

import { environment } from '@env/environment';
import { Forecast } from '@app/models';

@Component({
  selector: 'app-forecast',
  templateUrl: 'forecast.page.html',
  styleUrls: ['forecast.page.scss']
})
export class ForecastPage {
  icons = environment.icons;
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

  constructor() {}
}
```

**forecast.page.html**

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>
      Forecast
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-list>
    <ion-item *ngFor="let f of forecast">
      <kws-daily-forecast scale="F" [forecasts]="f" [iconPaths]="icons"></kws-daily-forecast>
    </ion-item>
  </ion-list>
</ion-content>
```

**forecast.page.scss**

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

**src/app/models/uv-index.ts**

```TypeScript
export interface UVIndex {
  value: number;
  riskLevel: number;
}
```

**Note:** remember to add the export for this file to `src/app/models/index.ts`!

**uv-index.page.ts**

```TypeScript
import { Component } from '@angular/core';

import { UVIndex } from '@app/models';

@Component({
  selector: 'app-uv-index',
  templateUrl: 'uv-index.page.html',
  styleUrls: ['uv-index.page.scss']
})
export class UvIndexPage {
  uvIndex: UVIndex = {
    value: 6.4,
    riskLevel: 3
  };

  advice: Array<string> = [
    'Wear sunglasses on bright days. If you burn easily, cover up and use broad spectrum SPF 30+ sunscreen. ' +
      'Bright surfaces, such as sand, water and snow, will increase UV exposure.',
    'Stay in the shade near midday when the sun is strongest. If outdoors, wear sun protective clothing, ' +
      'a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every ' + 
      '2 hours, even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water and ' +
      'snow, will increase UV exposure.',
    'Reduce time in the sun between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, ' +
      'a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 ' +
      'hours, even on cloudy days, and after swimming or sweating. Bright surfaces, such sand, water and snow, will ' +
      'increase UV exposure.',
    'Minimize sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, ' +
      'a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every 2 ' +
      'hours, even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water and snow, ' +
      'will increase UV exposure.',
    'Try to avoid sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun protective clothing, ' +
      'a wide-brimmed hat, and UV-blocking sunglasses. Generously apply broad spectrum SPF 30+ sunscreen every ' +
      '2 hours, even on cloudy days, and after swimming or sweating. Bright surfaces, such as sand, water and snow, ' + 
      'will increase UV exposure.'
  ];

  constructor() {}
}
```

**uv-index.page.html**

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>
      UV Index
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-text-center ion-padding" [fullscreen]="true">
  <kws-uv-index class="primary-value" [uvIndex]="uvIndex?.value"></kws-uv-index>
  <div class="description">{{ advice[(uvIndex?.riskLevel)] }}</div>
</ion-content>
```

**uv-index.page.scss**

```scss
.description {
  margin-top: 16px;
}
```

## Fix the Tests

There is a problem with the tests now. The problem is that we added custom elements to the HTML templates but we are not using the CUSTOM_ELEMENTS_SCHEMA in the tests. They also do not need the `forRoot()` portion on the `IonicModule` import. Update the module accordingly.

## Remove the `ExploreContainerComponent`

The `ExploreContainerComponent` is no longer required. Let's completely remove it from our source.

- Remove the `explore-container` folder (`rm -rf src/app/explore-container` for example)
- Find and remove all references to `ExploreContainerComponentModule` in the code

## Conclusion

In this lab you created a simple service and model and learned how to mock up the UI to ensure it looks the way you want it to look. Make sure you have a look at your app in both light and dark mode. Next we will look at how to get real data.

