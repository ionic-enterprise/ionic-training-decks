# Lab: Use the Data

In this lab you will learn how to:

- Inject a service into your pages
- Diagnose errors that occur while you are developing your application
- Retrieve real data from the service, replacing the mock data

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

When you run the application after this change, though, you should get an error like the following in the _console_ and in your _test runner_:

```
Error: StaticInjectorError(AppModule)[HttpClient]:
  StaticInjectorError(Platform: core)[HttpClient]:
    NullInjectorError: No provider for HttpClient!
```

What is going on with the application is that `HttpClient` is injected into the `WeatherService` service, but the `HttpClient` service has not been provided anywhere so the application does not know how to inject it. You need to modify the `AppModule` to import the `HttpClientModule` as such:

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

Save those changes and check your application - the error should be gone there. We will tackle the issue in the tests next by mocking the service.

## Mock the Service

Another problem is that the test for the `CurrentWeatherPage` has started failing because the `TestBed` does not know how to inject the `HttpClient`. This situation will be handled somewhat differently:

1. We are testing the page in isolation, so we should create a mock object for the weather service.
1. We need to provide the mock weather service to the test.

I prefer to keep my mocks along side my services. This has a couple of benefits:

1. It allows for having a standard mock for each service.
1. It makes it easy to remember to update the mock each time the service is updated.

### Create the Mock Service Factory

The factory creates a jasmine spy matching the API for the service. In the case of the weather service, each method returns an `EMPTY` observable by default.

**`src/app/services/weather/weather.service.mock.ts`**

```TypeScript
import { EMPTY } from 'rxjs';

export function createWeatherServiceMock() {
  return jasmine.createSpyObj('WeatherService', {
    current: EMPTY,
    forecast: EMPTY,
    uvIndex: EMPTY
  });
}
```

Creating this file causes the `npm start` build to begin failing as it tries to include the mock. Add the `**/*.mock.js` files to the exclusions in `src/tsconfig.app.json`

```JSON
  "exclude": [
    "test.ts",
    "**/*.mock.ts",
    "**/*.spec.ts"
  ]
```

### Inject the Mock Service

The mock can either be manually created and injecting via `useValue` or we can provide the factory for the service and let Angular's DI create the service for us. I prefer the latter.

```TypeScript
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentWeatherPage],
      providers: [
        { provide: WeatherService, useFactory: createWeatherServiceMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));
```

## Using the Data

There are two lifecycle events that are good candidates for getting data:

- `ngOnInit` - Angular lifecycle event, fired when a component is instantiated
- `ionViewDidEnter` - Ionic lifecycle event, fired each time a page is visited

In our application, we want to get new data each time the page is visited. The natural place to do this is the `ionViewDidEnter()` lifecycle event.

### Test First

We have some new functionallity to cover. That functionallity is "entering the page", and the requirements are "it gets the current weather" and "it assigns the the weather." Let's create some tests that express these requirements:

```TypeScript
  describe('entering the page', () => {
    it('gets the current weather', () => {
      const weather =  TestBed.get(WeatherService);
      component.ionViewDidEnter();
      expect(weather.current).toHaveBeenCalledTimes(1);
    });

    it('assigns the current weather', () => {
      const weather =  TestBed.get(WeatherService);
      weather.current.and.returnValue(of({
        temperature: 280.32,
        condition: 300,
        date: new Date(1485789600 * 1000)
      }));
      component.ionViewDidEnter();
      expect(component.currentWeather).toEqual({
        temperature: 280.32,
        condition: 300,
        date: new Date(1485789600 * 1000)
      });
    });
  });
```

**Note:** You will need to add `import { of } from 'rxjs';` to the top of your test file.

Once you get those test written, they should be failing. Let's talk about the strategy of those tests a bit before moving on to writing the code.

### Modify the Code

```TypeScript
  ionViewDidEnter() {
    this.weather.current().subscribe(w => (this.currentWeather = w));
  }
```

Finally, `currentWeather` can just be left declared but unassigned. Remove the mock data that is currently assigned to it.

```TypeScript
  currentWeather: Weather;
```

**Challenge:** Make similar modifications to the `forecast` and `uv-index` tests and pages.

## Conclusion

In the last two labs, we have learned how to abstract the logic to get data into a service and then how to use that service within our pages. Be sure to commit your changes.
