# Lab: Add a Loading Indicator

In this lab, you will learn how to use overlay component. Specifically the Loading Indicator.

## Test First

The LoadingController follows a pattern that is common in Ionic for type of components called "overlays." The mock package that is supplied with this project contains two mocks we can use to test any overlay component: `createOverlayControllerMock()` which mocks the controller and `createOverlayElementMock()` which mocks the element created by the overlay controller.

The mocks can be set up like such:

```TypeScript
  let loading;
  ...
  beforeEach(async(() => {
    loading = createOverlayElementMock('Loading');
    TestBed.configureTestingModule({
      declarations: [CurrentWeatherPage],
      providers: [
        { provide: WeatherService, useFactory: createWeatherServiceMock },
        {
          provide: LoadingController,
          useFactory: () =>
            createOverlayControllerMock('LoadingController', loading)
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));
```

The test tests should look something like this. Note that the two existing tests are change to use `async/await`:

```TypeScript
  describe('entering the page', () => {
    it('displays a loading indicator', async () => {
      const loadingController = TestBed.get(LoadingController);
      await component.ionViewDidEnter();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loading.present).toHaveBeenCalledTimes(1);
    });

    it('gets the current weather', async () => {
      const weather = TestBed.get(WeatherService);
      await component.ionViewDidEnter();
      expect(weather.current).toHaveBeenCalledTimes(1);
    });

    it('displays the current weather', async () => {
      const weather = TestBed.get(WeatherService);
      weather.current.and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000)
        })
      );
      await component.ionViewDidEnter();
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(() => resolve()));
      const t = fixture.debugElement.query(By.css('kws-temperature'));
      expect(t).toBeTruthy();
    });

    it('dismisses the loading indicator', async () => {
      const weather = TestBed.get(WeatherService);
      weather.current.and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000)
        })
      );
      await component.ionViewDidEnter();
      expect(loading.dismiss).toHaveBeenCalledTimes(1);
    });
  });
```

## Code Second

The general pattern for the code is something like this:

```TypeScript
async ionViewDidEnter() {
  const l = await this.loadingController.create({ options });
  l.present();
  this.weather.someMethod().subscribe(d => {
    this.someData = d;
    l.dismiss();
  });
}
```

You will, of course, need to import the `LoadingController` and inject it into your class. Have a look at the docs for the various options you can use. Make similar changes to all three of the pages.
