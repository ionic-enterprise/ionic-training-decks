# Lab: Use the Data

In this lab you will learn how to:

- Import a service into your pages
- Retrieve real data from the service, replacing the mock data

## Barrels

Before we go any farther, let's have a look at "barrel" files. In the last section, I suggested creating an `index.ts` file to make importing the models easier. This is often called a "barrel file". For models, it will look something like this:

```TypeScript
export * from './coordinate';
export * from './forecast';
export * from './uv-index';
export * from './weather';
export * from './weekly-forecast';
```

This allows us to import the models like this:

```TypeScript
import { Coordinate, UVIndex, Weather, WeeklyForecast } from '../models';
```

Instead of like this:

```TypeScript
import { Coordinate } from '../models/coordinate';
import { UVIndex } from '../models/uv-index';
import { Weather } from '../models/weather';
import { WeeklyForecast } from '../models/weekly-forecast';
```

Create a similar barrel file for the `util` directory.

## Current Weather Page

The changes required to use the weather service in the `CurrentWeatherPage.tsx` file are pretty straight forward:

First we need to import the service itself: `import { iconPaths, weather } from '../util';`

Next we need to call the service and set the state. We will use the `IonViewWillEnter` lifecycle hook to perform the actual work, but first we have to modify our state hooks a bit by removing the initial value assignment and grabbing a reference to the returned setter function:

```TypeScript
  const [temperature, setTemperature] = useState();
  const [condition, setCondition] = useState();
```

Now we can add the `IonViewWillEnter` lifecycle hook:

```TypeScript
  useIonViewWillEnter(async ()=>{
    const res = await weather.current();
    setTemperature(res.temperature);
    setCondition(res.condition);
  });
```

Make sure you import that hook from `@ionic/react`.

The complete code should look something like this:

```TypeScript
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import React, { useRef, useState, useEffect } from 'react';
import { iconPaths, weather } from '../util';

const CurrentWeatherPage: React.FC = () => {
  const [temperature, setTemperature] = useState();
  const [condition, setCondition] = useState();
  const ref = useRef(null);

  useEffect(() => {
    (ref.current as any)!.iconPaths = iconPaths;
  });

  useIonViewWillEnter(async ()=>{
    const res = await weather.current();
    setTemperature(res.temperature);
    setCondition(res.condition);
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Current Weather</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-text-center ion-padding">
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

Your snapshot test is probably failing at this point, so regenerate your snapshot. Don't worry about the fact that we are using the real data at this point. The data will not be fetched before the snapshot.

## Forecast and UV Index

At this point, you should be able to make similar modifications to the other two pages. Go ahead and give it a shot.

One hint: the foreast state hook requires some typing and should be initialized with an empty array:

```TypeScript
const [forecast, setForecast] = useState<WeeklyForecast>([]);
```

## Conclusion

In the last two labs, we have learned how to abstract the logic to get data into a service and then how to use that service within our pages. Be sure to commit your changes.
