# Lab: Getting Data

Your app looks nice, but it does not display real data. Let's fix that.

In this lab, you will learn how to:

* Create a new service using the Ionic CLI
* Use Angular's `HttpClient` service to get data from an API
* Transform the data for consumption by your application


## Getting Started

* Go to <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap.org</a> and sign up for a free account, then generate an API key for yourself
* Use `ionic g service services/weather/weather` to generate a new service

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

* All start with: `https://api.openweathermap.org/data/2.5`
* Can take several formats for location (we will use latitude/longitude)
* All take an `appid` parameter with the API key (this is less obvious)

The first version of the app will use a hard coded location. I am using Madison, WI, USA because that is where the Ionic HQ is located, but you should use something closer to your home. You can use a website such as <a href="https://www.latlong.net/" target="_blank">LatLong.net</a> to find the coordinates of your city. 

Add your key, the base URL, and your coordinates as private data in the service. My private data looks like this:

```TypeScript
  private appId = '69f068bb8bf2bc3e061cb2b62c255c65';  // or use your own API key
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  private latitude = 43.073051;
  private longitude = -89.401230;
```

## Getting the Data

Angular's <a href="https://angular.io/api/common/http/HttpClient" target="_blank">HttpClient</a> service is very flexible and has several options for working with RESTful data. We will not go into full details, as that could be a full course on its own. For the purposes of this course, we will only be using GET verb to retrieve data. 

The basic format for such a call is: `get(url: string): Observable<any>`. In our case, the url can be built as such: 

```TypeScript
${this.baseUrl}/foo?lat=${this.latitude}&lon=${this.longitude}&appid=${this.appId}
```

So a basic method that returns this data looks like this:

```TypeScript
  current(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/weather?lat=${this.latitude}&lon=${
        this.longitude
      }&appid=${this.appId}`);
  }
```

Add that method to your `weather` service to get the current weather. **Hint:** You'll need to import `Observable` from `rxjs` at the top of your file.

Add two additional methods: one called `forecast` that gets the forecast data and one called `uvIndex` that gets the UV Index data. **Hint:** Have a look at the <a href="https://openweathermap.org/api" target="_blank">Open Weather Map API Docs</a> for details on the endpoint names. The format of the `forecast` and `uvIndex` methods will be basically the same at this point other than the name of the endpoint.

## Transforming the Data

Now we can retrieve our data, but we need to transform it into a format that our application can use.

### Current Weather

#### Transforming the Result Object

Review the <a href="https://openweathermap.org/current#current_JSON" target="_blank">API docs</a> and have a look at our `Weather` model. We need grab the following data:

* **temperature** - Available as part of `main.temp`
* **condition** - This is the `weather.id`, but because `weather` is an array of objects, we will use the `id` from the first object in the array (`weather[0].id`) 
* **date** - This is available from `dt`; note that the date is Unix UTC

**Challenge**: Add a private method to your service called `unpackWeather`. I have given you the shell of what it should do. Use the information above to properly unpack the result and put the data into a `Weather` object.

```TypeScript
  private unpackWeather(res: any): Weather {
    return {
      temperature: ???,
      condition: ???,
      date: ???
    };
  }
```

#### Applying the Transform

Observables in rxjs can be piped through a whole host of operators. One of the most useful is `map` which is used to map one object to another. The basic syntax is: `this.http.get(url).pipe(map((res: any) => someTransform(res)));`

**Challenge:** apply the transform to your `current()` method:

* change the return type to `Observable<Weather>`
* append the `pipe` from above to the `get()` call as such: `.pipe(map((res: any) => this.unpackWeather(res)));`

**Hint:** You will need to import some stuff from a couple of different ES6 modules at the top of your file. The `map` function is in the `rxjs/operators` module.

## Forecast

Transforming the forecast data is more complex. We need to go through the `list` and create an array of forecasts for each individual day. I am going to give you the code for that. Try walking through it as you copy it in to understand how it is working. Have a look at the <a href="https://openweathermap.org/forecast5#JSON" target="_blank">response data structure</a> and compare it to how we are processing it here.

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

## UV Index

Here is the model we have for the UV index:

```TypeScript
export interface UVIndex {
  value: number,
  riskLevel: number
}
```

The <a href="https://openweathermap.org/api/uvi" target="_blank">response data</a> is very simple. There is only one property returned that is useful to us. That is the `value` property.

* **value** - Use the `value` from the HTTP result
* **riskLevel** - This level should be calculated by us based on the `value`:
   * 0 - `value` < 3
   * 1 - `value` >= 3 and < 6
   * 2 - `value` >= 6 and < 8
   * 3 - `value` >= 8 and < 11 
   * 4 - `value` >= 11

**Challenge:** Write a private `unpackUvIndex(res: any): UVIndex` method that unpacks the HTTP result as specified. You will need to write up some code to calculate the `riskLevel` as part of the method. When that is finished, apply the `map` transform as you did with the `forecast()` method.

## Conclusion 

Congratulations. You have learned how to craft a service that gets data and encapsulates some of the business logic of your application.

Compare your code to the completed code that I've included. It does not have to be identical, but it should be functionally equivalent. We have not tested any of this, which is scary and a really good argument for unit tests. Nonetheless, be sure to commit your changes in git.
