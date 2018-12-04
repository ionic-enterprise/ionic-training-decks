# Lab: Using the Data

In this lab you will learn how to:

* Inject a service into your pages
* Diagnose errors that occur while you are developing your application
* Retrieve real data from the service, replacing the fake data from our earlier mocking

## Injector Error 

Start by injecting the `WeatherProvider` into the `current-weather` page.

```TypeScript
import { WeatherProvider } from '../../providers/weather/weather';

...

  constructor(
    public iconMap: IconMapProvider,
    private weather: WeatherProvider
  ) {}
```

When you run the application after this change, though, you should get an error in the console like this one:

```
Error: Uncaught (in promise): Error: StaticInjectorError(AppModule)[WeatherProvider -> HttpClient]: 
  StaticInjectorError(Platform: core)[WeatherProvider -> HttpClient]: 
    NullInjectorError: No provider for HttpClient!
```

What is going on is that `HttpClient` is injected into your `WeatherProvider` service, but the `HttpClient` service has not been provided anywhere so the application does not know how to inject it. You need to modify the `AppModule` to import the `HttpClientModule` as such:

```TypeScript
import { HttpClientModule } from '@angular/common/http';

...

@NgModule({
  declarations: [
    MyApp,
    ForecastPage,
    UVIndexPage,
    CurrentWeatherPage,
    TabsPage
  ],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(MyApp)],
```

Save those changes and check your application - the error should be gone.

## Using the Data

In our application, we want to get new data each time the page is visited. The natural place to do this is the `ionViewDidEnter()` <a href="https://ionicframework.com/docs/api/navigation/NavController/#lifecycle-events" target="_blank">lifecycle event</a>.

```TypeScript
  ionViewDidEnter() {
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }
```

Finally, where `currentWeather` as initialized to fake data before it can just be left declared but unassigned.

```TypeScript
  currentWeather: Weather;
```

**Challenge:** Make similar modifications to the `forecast` and `uv-index` pages. 

Make sure all of your changes have been committed.