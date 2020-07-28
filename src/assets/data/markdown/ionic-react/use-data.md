# Lab: Use the Data

In this lab you will learn how to:

- Import a service into your pages
- Retrieve real data from the service, replacing the mock data

## Update the App Test

The app test will render the Current Weather page. If the rendering gets far enough along, the test may make an actual call to the backend service. We don't want that, so let's circumvent that possibility by mocking the weather service in `App.test.tsx` as such:

```typescript
import { weather } from './util';

let spy: any;
beforeAll(() => {
  spy = jest.spyOn(weather, 'current').mockImplementation(() =>
    Promise.resolve({
      temperature: 280.32,
      condition: 300,
      date: new Date(1485789600 * 1000),
    } as any),
  );
});

afterAll(() => spy.mockReset());
```

Now if `weather.current()` is called it will not do any harm.

## Current Weather Page

The changes required to use the weather service in the `CurrentWeatherPage.tsx` file are pretty straight forward:

First we need to import the service itself: `import { iconPaths, weather } from '../util';`

Next we need to call the service and set the state. We will use the `IonViewWillEnter` lifecycle hook to perform the actual work, but first we have to modify our state hooks a bit by removing the initial value assignment, typing it,  and grabbing a reference to the returned setter function:

```TypeScript
  const [temperature, setTemperature] = useState<number>();
  const [condition, setCondition] = useState<number>();
```

Removing the initial value will cause the bound web component to show "Unknown" if we have not gotten any weather data yet. Usually this will not be noticable, but it may be in a slow network (or no network) situation. We need to type the hooks, however, because TypeScript can no longer infer the type from context.

Now we can add the `IonViewWillEnter` lifecycle hook:

```TypeScript
  useIonViewWillEnter(async ()=> {
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
  const [temperature, setTemperature] = useState<number>();
  const [condition, setCondition] = useState<number>();
  const ref = useRef(null);

  useEffect(() => {
    (ref.current as any)!.iconPaths = iconPaths;
  });

  useIonViewWillEnter(async ()=> {
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

## Forecast and UV Index

At this point, you should be able to make similar modifications to the other two pages. Go ahead and give it a shot.

One hint: the foreast state hook requires some typing and should be initialized with an empty array:

```TypeScript
const [forecast, setForecast] = useState<WeeklyForecast>([]);
```

## Conclusion

In the last two labs, we have learned how to abstract the logic to get data into a service and then how to use that service within our pages. Be sure to commit your changes.
