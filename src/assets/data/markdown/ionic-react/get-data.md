# Lab: Getting Data

Your app looks nice, but it does not display real data. Let's fix that.

In this lab, you will learn how to:

- Create a service class
- Use the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank">fetch API</a> to get data from a service
- Transform the data for consumption by your application

## Getting Started

The service that we are using to get weather data has a free tier, but that tier still requires an API key. You have two options at this point:

- Go to <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap.org</a> and sign up for a free account, then generate an API key for yourself
- Use the key that has been supplied for this class (this key will be deleted at some point in the future)

We will be creating a "service" class that fetches the data from the weather API and transforms the data into models that are suitable for use within our application. Refer to the <a href="https://openweathermap.org/api" target="_blank">API docs<a/> for details on the weather service API.

## Create a Service

The first thing we need to do is create a service that will contain all of the business logic used to obtain the weather data and transform it for use throughout our application.

Under the `util` directory, create two files: `weather.test.ts` and `weather.ts`

### `weather.test.ts`

The `weather.test.ts` file will contain the unit tests for our service. For now, just import the "service" and create a test that shows that our service has been instantiated.

```TypeScript
import { weather } from './weather';

describe('weather service', () => {
  it('exists', () => {
    expect(weather).toBeTruthy();
  });
});
```

### `weather.ts`

At this point, we don't need our service to do much beyond just existing:

```TypeScript
class WeatherService {}

export const weather = new WeatherService();
```

## Current Weather

### Test First

Each test uses the fetch API to obtain data from the weather service API. We do not want to call the weather service directly, so let's mock the fetch API and have the mock return some test data.

Our test now looks like this:

```TypeScript
import { weather } from './weather';

describe('weather service', () => {
  let spy: any;
  beforeEach(() => {
    spy = jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve()
      } as any)
    );
  });

  afterEach(() => spy.mockReset());

  it('exists', () => {
    expect(weather).toBeTruthy();
  });

  describe('current weather', () => {
      let spy: any;
      beforeEach(() => {
        spy = jest.spyOn(window, 'fetch').mockImplementation(() =>
          Promise.resolve({
            json: () => Promise.resolve(currentWeather)
          } as any)
        );
      });

      afterEach(() => spy.mockReset());
  });
});

const currentWeather = {
  coord: { lon: -0.13, lat: 51.51 },
  weather: [{ id: 300, main: 'Drizzle', description: 'light intensity drizzle', icon: '09d' }],
  base: 'stations',
  main: { temp: 280.32, pressure: 1012, humidity: 81, temp_min: 279.15, temp_max: 281.15 },
  visibility: 10000,
  wind: { speed: 4.1, deg: 80 },
  clouds: { all: 90 },
  dt: 1485789600,
  sys: { type: 1, id: 5091, message: 0.0103, country: 'GB', sunrise: 1485762037, sunset: 1485794875 },
  id: 2643743,
  name: 'London',
  cod: 200
};
```

Our method has two requirements:

- it needs to fetch the data
- it needs to unpack the results into our model

Let's create a test for each requirement.

```TypeScript
  it('fetches the current weather for the current location', async () => {
    await weather.current();
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather?lat=43.073051&lon=-89.40123&appid=357d7d7f94bf6a9b04b534db299a1a3b'
    );
  });

  it('unpacks the result', async () => {
    const res = await weather.current();
    expect(res).toEqual({
      temperature: 280.32,
      condition: 300,
      date: new Date(1485789600 * 1000)
    });
  });
```

Note that the weather service API takes a few parameters: `lat`, `lon`, and `appid`. For now, we will be hard coding the latitude and longitude, so pick some coordinates that make sense for where you are. I am using the coordinates for Madison, WI. For the `appid`, you will either need to use your own key or the one provided for the class.

### Code Second

First let's define some data that will be used by all of our "fetch" methods:

```TypeScript
class WeatherService {
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private appId = '357d7d7f94bf6a9b04b534db299a1a3b';
}

export const weather = new WeatherService();
```

Next, let's perform the fetch and unpack the data. Per the fetch API, we will send the URL to fetch. Once we get the results, we will need to call the `json()` method to get the data in a format we can use. Once we have the data, we need three pieces of information:

- `temperature` - this is obtained from the `main` object
- `condition` - the `weather` array has this information. We will just use the `id` from the first object in the array.
- `date` - if the date is on the record, it will be in the `dt` property, and it will be in seconds, so we will need to check that it exists and and convert it from seconds into milliseconds in order to construct a Date

Upon completion, our code looks something like this:

```TypeScript
  async current(): Promise<Weather> {
    const res = await fetch(`${this.baseUrl}/weather?lat=43.073051&lon=-89.40123&appid=${this.appId}`);
    const data = await res.json();
    return {
      temperature: data.main.temp,
      condition: data.weather[0].id,
      date: data.dt && new Date(data.dt * 1000)
    };
  }
```

### Refactor

That code works, but it is horrible:

- the coordinates are hard coded
- the method itself knows how to do multiple things, specifically getting the data and unpacking the data

Let's clean that up a bit.

#### `currentLocation()`

We will eventually want to get our actual position using Geolocation. We aren't there yet, but let's abstract out a method that resolves to our current location:

```TypeScript
  private async currentLocation(): Promise<Coordinate> {
    return Promise.resolve({
      latitude: 43.073051,
      longitude: -89.40123
    });
  }
```

Creating the `Coordinate` model is an exercise left to the reader. We already have several examples. While you are in there, consider creating an `index.ts` file in the `models` folder to make importing the models easier.

#### `fetchData()`

Looking ahead a bit at the other weather service APIs we will use, the only part that changes is the endpoint itself, so we can abstract that out into a method that gets the weather data for a location.

```TypeScript
  private async fetchData(endpoint: string): Promise<any> {
    const loc = await this.currentLocation();
    const res = await fetch(`${this.baseUrl}/${endpoint}?lat=${loc.latitude}&lon=${loc.longitude}&appid=${this.appId}`);
    return res.json();
  }
```

#### `unpackWeather()`

The last private method we need is one to unpack the data from the weather service API and transform it into something more appropriate for our application:

```TypeScript
  private unpackWeather(data: any): Weather {
    return {
      temperature: data.main.temp,
      condition: data.weather[0].id,
      date: data.dt && new Date(data.dt * 1000)
    };
  }
```

#### Final Product

Thanks to our tests, we can perform each step while making sure our code still works the way we intend. The code should now look something like this:

```TypeScript
import { Coordinate, Weather } from '../models';

class WeatherService {
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private appId = '357d7d7f94bf6a9b04b534db299a1a3b';

  async current(): Promise<Weather> {
    const data = await this.fetchData('weather');
    return this.unpackWeather(data);
  }

  private async fetchData(endpoint: string): Promise<any> {
    const loc = await this.currentLocation();
    const res = await fetch(`${this.baseUrl}/${endpoint}?lat=${loc.latitude}&lon=${loc.longitude}&appid=${this.appId}`);
    return res.json();
  }

  private async currentLocation(): Promise<Coordinate> {
    return Promise.resolve({
      latitude: 43.073051,
      longitude: -89.40123
    });
  }

  private unpackWeather(data: any): Weather {
    return {
      temperature: data.main.temp,
      condition: data.weather[0].id,
      date: data.dt && new Date(data.dt * 1000)
    };
  }
}

export const weather = new WeatherService();
```

## Forecast

The forecasts are the most complex because we need to take an array of weather forecast objects and translate it into an array of forecasts for each day. Thankfully the refactoring we did above at least makes each step bite-sized and well organized.

### Test First

Our tests follow the same basic pattern that we have already established:

```TypeScript
describe('forecast', () => {
  let spy: any;
  beforeEach(() => {
    spy = jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(forecast)
      } as any)
    );
  });

  afterEach(() => spy.mockReset());

  it('fetches the forecast for the current location', async () => {
    await weather.forecast();
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/forecast?lat=43.073051&lon=-89.40123&appid=357d7d7f94bf6a9b04b534db299a1a3b'
    );
  });

  it('unpacks the result', async () => {
    const res = await weather.forecast();
    expect(res).toEqual([
      [
        {
          temperature: 283.76,
          condition: 800,
          date: new Date(1485799200 * 1000)
        },
        {
          temperature: 282.56,
          condition: 800,
          date: new Date(1485810000 * 1000)
        },
        {
          temperature: 282.3,
          condition: 800,
          date: new Date(1485820800 * 1000)
        }
      ],
      [
        {
          temperature: 280.3,
          condition: 340,
          date: new Date(1485896400 * 1000)
        },
        {
          temperature: 279.42,
          condition: 342,
          date: new Date(1485907200 * 1000)
        }
      ]
    ]);
  });
});
```

And our test data looks like this:

```TypeScript
const forecast = {
  list: [
    {
      dt: 1485799200,
      main: {
        temp: 283.76
      },
      weather: [
        {
          id: 800
        }
      ]
    },
    {
      dt: 1485810000,
      main: {
        temp: 282.56
      },
      weather: [
        {
          id: 800
        }
      ]
    },
    {
      dt: 1485820800,
      main: {
        temp: 282.3
      },
      weather: [
        {
          id: 800
        }
      ]
    },
    {
      dt: 1485896400,
      main: {
        temp: 280.3
      },
      weather: [
        {
          id: 340
        }
      ]
    },
    {
      dt: 1485907200,
      main: {
        temp: 279.42
      },
      weather: [
        {
          id: 342
        }
      ]
    }
  ]
};
```

### Code Second

Satisfying the first test is easy, especially with the pattern we have already created:

```TypeScript
  async forecast(): Promise<WeeklyForecast> {
    const data = await this.fetchData('forecast');
    return this.unpackForecast(data);
  }
  ...
    private unpackForecast(data: any): WeeklyForecast {
    return data;
  }
```

To satisfy the second test, we need to flesh out the `unpackForecast()` method:

```TypeScript
  private unpackForecast(data: any): WeeklyForecast {
    let currentDay: Array<Weather>;
    let prevDate: number;
    const forecast: WeeklyForecast = [];

    data.list.forEach((item: any) => {
      const w = this.unpackWeather(item);
      if (w.date!.getDate() !== prevDate) {
        prevDate = w.date!.getDate();
        currentDay = [];
        forecast.push(currentDay);
      }
      currentDay.push(w);
    });

    return forecast;
  }
```

## UV Index

The UV index is fairly simple. The model for the index looks like this (creating it is left as an exercise for you):

```TypeScript
export interface UVIndex {
  value: number;
  riskLevel: number;
}
```

 We get the UV index itself from the `value` property of the result, and then we calculate a risk level based on the following schedule:

  - 0 - `value` < 3
  - 1 - `value` >= 3 and < 6
  - 2 - `value` >= 6 and < 8
  - 3 - `value` >= 8 and < 11
  - 4 - `value` >= 11

I will provide the tests for these and let you write the code.

```TypeScript
describe('UV index', () => {
  let spy: any;
  beforeEach(() => {
    spy = jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(uvi)
      } as any)
    );
  });

  afterEach(() => spy.mockReset());

  it('fetches the UV Index for the current location', async () => {
    await weather.uvIndex();
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/uvi?lat=43.073051&lon=-89.40123&appid=357d7d7f94bf6a9b04b534db299a1a3b'
    );
  });

  it('unpacks the result', async () => {
    const res = await weather.uvIndex();
    expect(res).toEqual({
      value: 10.06,
      riskLevel: 3
    });
  });

  it.each([[0, 0], [2.99, 0], [3, 1], [5.99, 1], [6, 2], [7.99, 2], [8, 3], [10.99, 3], [11, 4], [15, 4]])(
    'assigns the proper risk level for value %i',
    async (value, risk) => {
      uvi.value = value;
      const res = await weather.uvIndex();
      expect(res.riskLevel).toEqual(risk);
    }
  );
});

...

const uvi = {
  lat: 37.75,
  lon: -122.37,
  date_iso: '2017-06 - 26T12: 00: 00Z',
  date: 1498478400,
  value: 10.06
};
```

Remember to follow the pattern we have already established in the code, and that each method should just do one thing, so you should probably have a `riskLevel()` method that gets called from your `unpackUVIndex()` method.

## Conclusion

Congratulations. You have learned how to craft a service class that gets data and encapsulates some of the business logic of your application.
