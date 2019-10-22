# Lab: Getting Data

Your app looks nice, but it does not display real data. Let's fix that.

In this lab, you will learn how to:

- Create a new service using the Ionic CLI
- Use Angular's `HttpClient` service to get data from an API
- Transform the data for consumption by your application

## Getting Started

- Go to <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap.org</a> and sign up for a free account, then generate an API key for yourself
- Use `ionic g service services/weather/weather` to generate a new service

## Inject the HTTP Client

The generated `weather` service is just a shell for an injectable class. We need to provide the details. The primary purpose of this service will be to get JSON data from the API via HTTP, so we will need to inject Angular's HTTP client service. Dependency injection in Angular is handled via the constructor. Inject the HTTP client, creating a `private` reference to it.

```TypeScript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private http: HttpClient) {}
}
```

### Basic Configuration

Let's add some basic configuration data. Have a look at the <a href="https://openweathermap.org/api" target="_blank">Open Weather Map API</a> documentation. You will see that the various endpoints:

- All start with: `https://api.openweathermap.org/data/2.5`
- Can take several formats for location (we will use latitude/longitude)
- All take an `appid` parameter with the API key (this is less obvious)

#### Environments

For this application, all API traffic is going to go through `https://api.openweathermap.org/data/2.5`. It is common for applications to use different APIs for development and production, so let's setup this application to support that contingency from the start.

Define the following values in `src/environments/environment.ts` and `src/environments/environment.prod.ts`:

- baseUrl: 'https://api.openweathermap.org/data/2.5'
- appId: 'Whatever your APP ID is...'

Be sure to preserve the `production: true|false` flag in each file.

_Note:_ is a real app, you might want to protect your app ID more, at least if that app's code is stored in a publically available repo. Securing that data is beyond the scope of this course.

#### Location Data

The first version of the app will use a hardcoded location. I am using Madison, WI, USA because that is where the Ionic HQ is located, but you should use something closer to your home. You can use a website such as <a href="https://www.latlong.net/" target="_blank">LatLong.net</a> to find the coordinates of your city.

Add the coordinates you would like to use as private data in the `src/app/services/weather/weather.service.ts` service. My private data looks like this:

```TypeScript
  private latitude = 43.073051;
  private longitude = -89.401230;
```

## Getting the Data

Angular's <a href="https://angular.io/api/common/http/HttpClient" target="_blank">HttpClient</a> service is very flexible and has several options for working with RESTful data. We will not go into full details, as that could be a full course on its own. For the purposes of this course, we will only be using GET verb to retrieve data.

### Test Setup

If you are not still running the unit tests, be sure and start them. You should see one test failing. That is the test for this service, and it is failing because the test does not know how to inject the `HttpClient`. The `@angular/common/http/testing` library will be used to mock the `HttpClient` for our tests. Some simple setup will fix that.

```TypeScript
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: WeatherService = TestBed.get(WeatherService);
    expect(service).toBeTruthy();
  });
});
```

Don't worry about the fact that we are currently getting a `HttpTestingController` and not using it. We will address that next.

### Get the Current Weather

#### Test First

We need to get the current weather using an URL similar to the following: `https://api.openweathermap.org/data/2.5/weather?lat=43.073051&lon=-89.40123&appid=something`. Let's create a test for that:

```
  describe('current', () => {
    it('gets the data from the server', () => {
      const service: WeatherService = TestBed.get(WeatherService);
      service.current().subscribe();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=43.073051&lon=-89.40123&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });
  });
```

#### Write the Code

The basic format for such a `get()` call is: `get(url: string): Observable<any>`, so a basic method that returns this data looks like this:

```TypeScript
  current(): Observable<any> {
    return this.http.get(
      `${environment.baseUrl}/weather?lat=${this.latitude}&lon=${
        this.longitude
      }&appid=${environment.appId}`);
  }
```

**Hints:**

- You will need to import `Observable` from `rxjs` at the top of your file.
- You will also to `import { environment } from '../../../environments/environment';`

### Add the Other Methods

Add two additional methods: one called `forecast` that gets the forecast data from the `forecast` endpoint (5 day / 3 hour forecast) and one called `uvIndex` that gets the UV Index data from the `uvi` endpoint (UV Index). **Hint:** Have a look at the <a href="https://openweathermap.org/api" target="_blank">Open Weather Map API Docs</a> for more information on the endpoints. The format of the `forecast` and `uvIndex` methods will be basically the same at this point other than the name of the endpoint.

**Be sure the first create tests, then write code.**

## Transforming the Data

Now we are retrieving data, but we need to transform it into a format that our application can use.

### Current Weather

Review the <a href="https://openweathermap.org/current#current_JSON" target="_blank">API docs</a> and have a look at our `Weather` model. We need grab the following data:

- **temperature** - Available as part of `main.temp`
- **condition** - This is the `weather.id`, but because `weather` is an array of objects, we will use the `id` from the first object in the array (`weather[0].id`)
- **date** - This is available from `dt`; note that the date is Unix UTC, which is specified in seconds whereas JavaScript uses milliseconds

First we create a test that exercises the transform:

```TypeScript
    it('transforms the data', () => {
      const service: WeatherService = TestBed.get(WeatherService);
      let weather: Weather;
      service.current().subscribe(w => (weather = w));
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=43.073051&lon=-89.40123&appid=${
          environment.appId
        }`
      );
      req.flush({
        weather: [
          {
            id: 300
          },
          {
            id: 420
          }
        ],
        main: {
          temp: 280.32
        },
        dt: 1485789600
      });
      httpTestingController.verify();
      expect(weather).toEqual({
        temperature: 280.32,
        condition: 300,
        date: new Date(1485789600 * 1000)
      });
    });
```

**Challenge**: write the code to satisfy the test

**Hints:**

- Observables in rxjs can be piped through a whole host of operators. One of the most useful is `map` which is used to map one object to another. The basic syntax is: `this.http.get(url).pipe(map((res: any) => someTransform(res)));`
- You will need to import some stuff from a couple of different ES6 modules at the top of your file.
- The `map` function is in the `rxjs/operators` module.
- Change the return type of `current()` to `Observable<Weather>`
- Create a private method called `unpackWeather(res: any): Weather` that transforms the data from the raw result to a `Weather` object
- Append the `pipe` to the `get()` call as such: `.pipe(map((res: any) => this.unpackWeather(res)));`

When you are done, your code should look something like this:

```TypeScript
  current(): Observable<Weather> {
    return this.http
      .get(
        `${environment.baseUrl}/weather?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map(res => this.unpackWeather(res)));
  }

  ...

  private unpackWeather(res: any): Weather {
    return {
      // add code to transform the data here...
    };
  }
```

### Forecast

Transforming the forecast data is more complex. We need to go through the `list` and create an array of forecasts for each individual day. I am going to give you the test and the code for that. Try walking through it as you copy it in to understand how it is working. Have a look at the <a href="https://openweathermap.org/forecast5#JSON" target="_blank">response data structure</a> and compare it to how we are processing it here.

**Test**

```TypeScript
    it('transforms the data', () => {
      const service: WeatherService = TestBed.get(WeatherService);
      let forecast: Forecast;
      service.forecast().subscribe(f => (forecast = f));
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/forecast?lat=43.073051&lon=-89.40123&appid=${
          environment.appId
        }`
      );
      req.flush({
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
          },
        ]
      });
      httpTestingController.verify();
      expect(forecast).toEqual([[
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
        condition:342,
        date: new Date(1485907200 * 1000)
      },
      ]]);
    });
```

**Transform Function**

```TypeScript
  private unpackForecast(res: any): Forecast {
    let currentDay: Array<Weather>;
    let prevDate: number;
    const forecast: Forecast = [];

    res.list.forEach(item => {
      const w = this.unpackWeather(item);
      if (w.date.getDate() !== prevDate) {
        prevDate = w.date.getDate();
        currentDay = [];
        forecast.push(currentDay);
      }
      currentDay.push(w);
    });

    return forecast;
  }
```

**Challenge:** Now that you have the transform, apply it in your `forecast()` method. Remember that you should change the return type - specifically, the type is currently `Observable<any>` but `any` is far too broad, we can narrow that down.

### UV Index

Here is the model we have for the UV index:

```TypeScript
export interface UVIndex {
  value: number,
  riskLevel: number
}
```

The <a href="https://openweathermap.org/api/uvi" target="_blank">response data</a> is very simple. There is only one property returned that is useful to us. That is the `value` property.

- **value** - Use the `value` from the HTTP result
- **riskLevel** - This level should be calculated by us based on the `value`:
  - 0 - `value` < 3
  - 1 - `value` >= 3 and < 6
  - 2 - `value` >= 6 and < 8
  - 3 - `value` >= 8 and < 11
  - 4 - `value` >= 11

**Challenge:** Test and code the UV transform.

- The test will follow the same basic pattern as the other "transforms the data" tests
- The "flush" data will look something like this: `{ value: 3 }`
- The "expected" data will look something like this: `{ value: 3, riskLevel: 1 }`
- The transform should be similar to the other transforms.
- The code is cleaner if you write a private method to calculate the risk level.

One way to write that test is to create a testng template and feed an array of value to the test template as such:

```TypeScript
    [
      { value: 0, riskLevel: 0 },
      { value: 2.9, riskLevel: 0 },
      { value: 3, riskLevel: 1 },
      { value: 5.9, riskLevel: 1 },
      { value: 6, riskLevel: 2 },
      { value: 7.9, riskLevel: 2 },
      { value: 8, riskLevel: 3 },
      { value: 10.9, riskLevel: 3 },
      { value: 11, riskLevel: 4 },
      { value: 18, riskLevel: 4 }
    ].forEach(test =>
      it(`transforms the data (value: ${test.value})`, () => {
        const service: WeatherService = TestBed.get(WeatherService);
        let uvIndex: UVIndex;
        service.uvIndex().subscribe(i => (uvIndex = i));
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/uvi?lat=43.073051&lon=-89.40123&appid=${environment.appId}`
        );
        req.flush({ value: test.value });
        expect(uvIndex).toEqual({ value: test.value, riskLevel: test.riskLevel });
        httpTestingController.verify();
      })
    );
```

## Conclusion

Congratulations. You have learned how to craft a service that gets data and encapsulates some of the business logic of your application.
