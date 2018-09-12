# Lab: Using the Data Service

## Injector Error 

Start by creating a feature branch and then injecting the `WeatherProvider` into the current weather page.

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
core.js:1449 ERROR Error: Uncaught (in promise): Error: StaticInjectorError(AppModule)[WeatherProvider -> HttpClient]: 
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

## Get the Data

It makes sense to get new data each time the page is visited. The natural place to do this is the `ionViewDidEnter()` lifecycle event.

```TypeScript
  ionViewDidEnter() {
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }
```

Finally, where `currentWeather` as initialized to fake data before it can just be left declared but unassigned.

```TypeScript
  currentWeather: Weather;
```

**Challenge:** Make similar modifications to the forecast and UV Index pages. 