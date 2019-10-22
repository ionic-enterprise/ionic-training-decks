# Lab: Mock Up the Interface

It is often desirable to lay out the user interface without worrying about how to get the data that will be displayed. This allows us to concentrate solely on how the application will look at feel, and to get that worked out early in the process.

In this lab, you will learn how to:

- Create classes to model data
- Install assets that can be used by your application
- Model the data
- Mock up the user interface

## Change the Tabs

With the starter application, all of the page names, sources, and paths were modified to make more sense for our application, but the labels and icons were not. Let's fix that now.

Open the `App.tsx` file. Currently it looks like this:

```TypeScript
const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/current-weather" component={CurrentWeatherPage} exact={true} />
          <Route path="/forecast" component={ForecastPage} exact={true} />
          <Route path="/forecast/details" component={Details} />
          <Route path="/uv-index" component={Tab3} />
          <Route path="/" render={() => <Redirect to="/current-weather" />} exact={true} />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/current-weather">
            <IonIcon icon={flash} />
            <IonLabel>Tab One</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/forecast">
            <IonIcon icon={apps} />
            <IonLabel>Tab Two</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/uv-index">
            <IonIcon icon={send} />
            <IonLabel>Tab Three</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);
```

In the `App.test.tsx` file, there is a test for the tab labels. It looks like this:

```TypeScript
it.each([
  [0, "Tab One"],
  [1, "Tab Two"],
  [2, "Tab Three"]
])("contains the proper text for tab %i", (tab, text) => {
  const { container } = render(<App />);
  expect(
    container.querySelectorAll("ion-tab-button")[tab as number].textContent
  ).toEqual(text);
});
```

Change both of these files such that the tabs use the following icons and labels:

- **Tab:** current-weather
  - **Icon:** cloud
  - **Label:** Current Weather
- **Tab:** forecast
  - **Icon:** calendar
  - **Label:** Forecast
- **Tab:** uv-index
  - **Icon:** sunny
  - **Label:** UV Index

## Specify Our Icon Paths

In order to allow each application to define its own weather condition images and where they exist, this library uses a specific map object. Let's create an object that can easily be imported where needed.

Create a file called `src/util/iconPaths.ts`. This file will export a single object defining the icon paths as such:

```TypeScript
export const iconPaths = {
  sunny: 'assets/images/sunny.png',
  cloudy: 'assets/images/cloudy.png',
  lightRain: 'assets/images/light-rain.png',
  shower: 'assets/images/shower.png',
  sunnyThunderStorm: 'assets/images/partial-tstorm.png',
  thunderStorm: 'assets/images/tstorm.png',
  fog: 'assets/images/fog.png',
  snow: 'assets/images/snow.png',
  unknown: 'assets/images/dunno.png'
};
```

## Install the Images

The object we just created references several image assets, but these assets to do not exist yet. <a download href="/assets/images/images.zip">Download the images</a> and unpack the zip file under `public/assets`, creating an `images` folder with the images in them.

**Note:** the specifics on doing this depends on the type of machine you are using. On a Mac:

1. Drag and drop the `images.zip` from `Downloads` into `public/assets`
1. Double click the `images.zip` file in `public/assets`, which creates an `images` folder
1. Remove the `images.zip` file
1. Find the favicon.png file and move it into `public/assets/icon`

## Mock Up the Component Usage

Let's mock up how the components will be used in each page. This allows us to test out exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts. This is a common technique used when layout out the interface for an application.

### Current Weather

#### Page Component

Let's walk through the changes that need to be made to the `CurrentWeather.tsx` file. Try to do all of this without peakng at the final code at the end:

- change the `IonTitle` to "Current Weather"
- remove the current contents defined for the `IonContent` (do not remove the `IonContent` tags themselves)
- import the iconPaths as such `import { iconPaths  } from "../util/iconPaths";`
- add a couple of hooks to set the data as such:

```TypeScript
import React, { useState } from 'react';
...
const CurrentWeather: React.FC = () => {
  const [temperature] = useState(302);
  const [condition] = useState(200);
```

- add the following HTML within the `IonContent`:

```HTML
        <div className="information">
          <kws-temperature class="primary-value" scale="F" temperature={temperature}></kws-temperature>
        </div>
        <kws-condition condition={condition} ref={ref}></kws-condition> 
```

Note that the class for `kws-temperature` is set using `class` just like in normal HTML and not using the usual React `className` hack-around. That is because this is a custom element and not either a standard HTML element or a React component.

Also note the "ref" bit on the `kws-condition`. That is necessary because we need to pass the `iconPaths` object to the web component. However, React doesn't particularily work well with standard web components and would only pass the a string to the property, so instead, we will get a ref to the element and then we will use the Effect hook to set the property as such:

```TypeScript
import React, { useRef, useState } from 'react';
...
const CurrentWeather: React.FC = () => {
  ...
  const ref = useRef(null);

  useEfffect(() => {
    (ref.current as any)!.iconPaths = iconPaths;
  });
```

- finally, clean up the unused imports from the original page

The code should now look something like this:

```TypeScript
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import './CurrentWeather.css';
import { iconPaths } from '../util/iconPaths';

const CurrentWeatherPage: React.FC = () => {
  const [temperature] = useState(302);
  const [condition] = useState(200);
  const ref = useRef(null);

  useEfffect(() => {
    (ref.current as any)!.iconPaths = iconPaths;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Current Weather</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="information">
          <kws-temperature class="primary-value" scale="F" temperature={temperature}></kws-temperature>
        </div>
        <kws-condition condition={condition} ref={ref}></kws-condition>
      </IonContent>
    </IonPage>
  );
};

export default CurrentWeatherPage;
```

#### TypeScript Declarations

The above changes result in compilation errors because the web components are not know to TypeScript. To avoid this issue, add a file named `src/declarations.d.ts` and add the following contents to it:

```TypeScript
declare namespace JSX {
  interface IntrinsicElements {
    'kws-temperature': any;
    'kws-condition': any;
  }
}
```

Restart the dev server after making this change.

#### Styles

We now see the page with the current weather information on it, but it could use some formatting. Let's add the following to the `theme/styles.css` file:

```css
kws-condition {
  --kws-condition-image-height: 212px;
  --kws-condition-label-font-size: 24px;
}
```

It would also be nice if the text were centered and the page padded, so let's add some classes to the content:

```HTML
<IonContent className="ion-text-center ion-padding">
```

At this point, the `CurrentWeather.css` file no longer serves a purpose. You can remove its reference from `CurrentWeather.tsx` and delete the file.

### Forecast

#### Cleanup

The current `Forecast.tsx` file has some cruft left over from the starter that demonstrates navigating to a child `Details.tsx` page. Let's start by removing all of that so we have nothing within the `IonContent` node. The route for the "Details" page is defined in `App.tsx`. You will need to remove the reference from there as well.

Remove any unused references in the `Forecast.tsx` file as well.

#### Models

Each `kws-daily-forecast` element takes an array of `Weather` data for a given day. We will give the forecasts for several days, so we will need an array of those forecasts. Let's model all of that out.

##### `src/models/weather.ts`

```TypeScript
export interface Weather {
  temperature: number;
  condition: number;
  date?: Date;
}
```

##### `src/models/forecast.ts`

```TypeScript
import { Weather } from './weather';

export type Forecast = Array<Weather>;
```

##### `src/models/weekly-forecast.ts`

```TypeScript
import { Forecast } from './forecast';

export type WeeklyForecast = Array<Forecast>;
```

#### Daily Forecast Component

Since we are going to have to pass objects to a HTML standard web component (not a React component), we are going to have to use that `ref` trick several times. This will be easiest if we take the HTML standard web component and wrap it with a React component.

Create a `src/compnents/DailyForecast.tsx` file. Its contents will look like this:

```TypeScript
import React, { useRef, useEffect } from 'react';
import { Forecast } from '../models/forecast';
import { iconPaths } from '../util/iconPaths';

const DailyForecast: React.FC<{ forecast: Forecast; scale: string }> = ({ forecast, scale }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    (elementRef.current as any)!.iconPaths = iconPaths;
    (elementRef.current as any)!.forecasts = forecast;
  }, [forecast]);

  return <kws-daily-forecast scale={scale} ref={elementRef}></kws-daily-forecast>;
};

export default DailyForecast;
```

Be sure and update the `src/declarations.d.ts` file accordingly.

#### Forecast Page Component

Start with the easy change. Change the page's title for "Forecast".

Next, create some fake data to display. We will use three days worth of data, and each data will only have a single weather point. In the real world, each day will have multiple weather records.

```TypeScript
  const [forecast] = useState([
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
  ]);
```

We now need to bring in our wrapped daily forecast component and bind one for each day's worth of data that we have:

```TypeScript
        <IonList>
          {forecast.map((f, index) => (
            <IonItem key={index}>
              <DailyForecast scale="F" forecast={f}></DailyForecast>
            </IonItem>
          ))}
        </IonList>
```

The final code should look something like this:

```TypeScript
import React, { useState } from 'react';
import { IonContent, IonHeader, IonItem, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import DailyForecast from '../components/DailyForecast';

const ForecastPage: React.FC = () => {
  const [forecast] = useState([
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
  ]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Forecast</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {forecast.map((f, index) => (
            <IonItem key={index}>
              <DailyForecast scale="F" forecast={f}></DailyForecast>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ForecastPage;
```

#### Styles

That works, but it looks funny. We now need to update the styles. We will once again do this globally:

```css
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

#### UV Index Page Component

We will once again start with the simple task and change the page's title to "UV Index".

Next, add some fake data:

```TypeScript
  const [uvIndex] = useState(6.4);
  const [riskLevel] = useState(3);
```

And some data that defines the descriptions we will show:

```TypeScript
  const advice: Array<string> = [
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
```

Finally, add the markup (and remember to update the `src/declarations.d.ts` file again because web components).

```HTML
      <IonContent className="ion-padding ion-text-center">
        <kws-uv-index class="primary-value" uv-index={uvIndex}></kws-uv-index>
        <div className="description">{advice[riskLevel]}</div>`
      </IonContent>
```

Note that we are using the `uv-index` "attribute" rather than the `uvIndex` property. This has to do with the way React translates these things and binds them on the elements.

#### Styles

That already looks pretty good, but we could use a little more of a gap between the index value and the long description. This is a very local and specifc tweak so we will make it locally to the `src/pages/UVIndex.tsx` file.

```TypeScript
  const descriptionStyle = {
    marginTop: '16px'
  }
  ...
        <div className="description" style={descriptionStyle}>
          {advice[riskLevel]}
        </div>
```

## Conclusion

In this lab you learned how to mock up the UI to ensure it looks the way you want it to look. Next we will look at how to get real data.
