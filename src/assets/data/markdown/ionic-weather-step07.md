# Lab: Get Data

Your app looks nice, but it does not display real data. Let's fix that.

In this lab, you will create a new service called `WeatherProvider` and then use Angular's HttpClient service to get data from <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap.org</a>. You will then transform that data into something that can be consumed by your application in order to display data to the user.

## Getting Started

The commands to accomplish the following should be familiar to you at this point, but if you have any questions please ask.

* go to <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap.org</a> and sign up for a free account so you can have an API key (if you do not want to do this, you can use the API key I generated for this class, but I _will_ be removing it after the class is over)
* create a new feature branch
* use the Ionic CLI to generate a new provider (hint: the ionic CLI has a `--help` option that can be used at several levels)
* use git to verify the files were created as you expect and that your new service is provided in `app.module.ts`
* be sure to add the newly generated file to your commit
* make your initial commit for this feature

The API key to use if you do not want to generate your own is currently: db046b8bbe642b799cb40fa4f7529a12

## Initial Setup

The generated service gives you a lot of what you need to get started, but let's clean that up a little.

1. the comment is helpful the first time you see it, rather pointless after that, remove it
1. the `HttpClient` is injected `public` to avoid a linting error until you actually use it, make it private
1. there is no need to do anything in the constructor, make it have an empty body

### Basic Configuration

Let's add some basic configuration data. Have a look at the <a href="https://openweathermap.org/api" target="_blank">Open Weather Map API</a> documentation. You will see that the various endpoints all have several things in common:

* they all start with: `http://api.openweathermap.org/data/2.5`
* they all can take several formats for location (we will use lat/lng)
* less obviously, they all take an `appid` parameter with the API key

The first version of the app will use a hard coded location. I am using Madison, WI, USA because that is where the Ionic HQ is but you should use something closer to your home. You can use a web-site such as <a href="https://www.latlong.net/" target="_blank">LatLong.net</a> to find the coordinates of your city. Add your key, the base URL, and your coordinates as private data in the service.

My private data looks like this:

```TypeScript
  private appId = 'db046b8bbe642b799cb40fa4f7529a12';
  private baseUrl = 'http://api.openweathermap.org/data/2.5';

  private latitude = 43.073051;
  private longitude = -89.401230;
```

## Getting the Data

Angular's <a href="https://angular.io/api/common/http/HttpClient" target="_blank">HttpClient</a> service is very flexible and has several options for working with RESTful data. This course cannot go into all of that as it could be a full course on its own. For the purpose of this course, we will only be using the GET verb to get data. The basic format for such a call is: `get(url: string): Observable<any>`. For our case, the url can be built as such: `${this.baseUrl}/foo?lat=${this.latitude}&lon=${this.longitude}&appid=${this.appId}`. So a basic method that returns this data looks like this:

```TypeScript
  current(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/weather?lat=${this.latitude}&lon=${
        this.longitude
      }&appid=${this.appId}`);
  }
```

Add that method to your service plus one for forecasts and the UV index. Refer to the API docs for the exact endpoint to use.

**Hint:** you need to import `Observable` from `rxjs` at the top of your file.

## Transforming the Data

We currently have the data, but we need to transform it into a format that our application can use.

### Current Weather

#### Transforming the Result Object

Have a look at the <a href="https://openweathermap.org/current#current_JSON" target="_blank">API docs</a>. Also have a look at our own `Weather` model. We need grab the following data:

* **temperature** - we can grab this from `main.temp`
* **condition** - this is the `weather.id`, but `weather` is an array of objects, so just grab the `id` from the first one (`weather[0].id`) 
* **date** - we can grab this from `dt` but note that the date is unix UTC and thus seconds from the epoch rather than milliseconds (for this app we don't really have to worry about timezones, so ignore that detail)

**Challenge**: Add a private method to your service called `unpackWeather` that has the following signature: `private unpackWeather(res: any): Weather`. Unpack `res` (the result of the HTTP call) as described above and then return it in a `Weather` object.

Try to complete this challenge without looking at the completed code.

#### Applying the Transform

Observables in rxjs can be piped through a whole host of operators. One of the most useful is `map` which is used to map one object to another. The basic syntax is: `this.http.get(url).pipe(map(res: any) => someTransform(res));`

**Challenge:** apply the transform to your `current()` method:

* change the return type to `Observable<Weather>`
* append the `pipe` from above to the `get()` call as such: `.pipe.map((res: any) => this.unpackWeather(res));`

**Hint:** You will need to import some stuff from a couple of different ES6 modules at the top of your file. The `map` function is in the `rxjs/operators` module.

## Forecast

Transforming the forecast data is more complex. We need to go through the `list` and create an array of forecasts for each individual day. I am going to give you the code for that. Try walking through it as you copy it in to understand how it is working.

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

**Challenge:** now that you have the transform, apply it in your `forecast()` method. Remember that you should change the return type. Specifically the type specified for the `Observable<T>`.

## UV Index

Here is the model we have for the UV index:

```TypeScript
export interface UVIndex {
  value: number,
  riskLevel: number
}
```

* **value** - use the `value` from the HTTP result
* **riskLevel** - this is based on the `value` as such:
   * 0 - a `value` < 3
   * 1 - a `value` >= 3 and < 6
   * 2 - a `value` >= 6 and < 8
   * 3 - a `value` >= 8 and < 11 
   * 4 - a `value` >= 11

**Challenge:** write a private `unpackUVIndex(res: any): UVIndex` method that unpacks the HTTP result as specified. When you are complete, apply the transform.

## Finish the Feature

Compare your code to the completed code that I included. It does not have to match identically, but it should be functionally equivalent. We have not tested any of this yet, which is scary and a really good argument for unit tests. None the less, let's squash the commits you made and merge this branch into master
