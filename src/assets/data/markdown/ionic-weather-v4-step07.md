# Lab: Using the Data

In this lab you will learn how to:

* Inject a service into your pages
* Diagnose errors that occur while you are developing your application
* Retrieve real data from the service, replacing the mock data

## Injector Error 

Start by injecting the `WeatherService` into the `current-weather` page.

```TypeScript
import { WeatherService } from '../services/weather/weather.service';

...

  constructor(
    public iconMap: IconMapService,
    private weather: WeatherService
  ) {}
```

When you run the application after this change, though, you should get an error in the console like this one:

```
Error: StaticInjectorError(AppModule)[HttpClient]: 
  StaticInjectorError(Platform: core)[HttpClient]: 
    NullInjectorError: No provider for HttpClient!
```

What is going on is that `HttpClient` is injected into the `WeatherService` service, but the `HttpClient` service has not been provided anywhere so the application does not know how to inject it. You need to modify the `AppModule` to import the `HttpClientModule` as such:

```TypeScript
import { HttpClientModule } from '@angular/common/http';

...

@NgModule({
  ...
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  ...
})
export class AppModule {}
```

Save those changes and check your application - the error should be gone.

## Using the Data

There are two lifecycle events that are good candidates for getting data:

* `ngOnInit` - Angular lifecycle event, fired when a component is instantiated
* `ionViewDidEnter` - Ionic lifecycle event, fired each time a page is visited

In our application, we want to get new data each time the page is visited. The natural place to do this is the `ionViewDidEnter()` lifecycle event.

```TypeScript
  ionViewDidEnter() {
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }
```

Finally, `currentWeather` can just be left declared but unassigned. Remove the mock data that is currently assigned to it.

```TypeScript
  currentWeather: Weather;
```

**Challenge:** Make similar modifications to the `forecast` and `uv-index` pages. 

## Conclusion

In the last two labs, we have learned how to abstract the logic to get data into a service and then how to use that service within our pages. Be sure to commit your changes.
