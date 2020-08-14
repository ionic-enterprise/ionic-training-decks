# Lab: Add a Loading Indicator

In this lab, you will learn how to use overlay component. Specifically the Loading Indicator.

## Test First

In this lab, you will modify the tests and the code for the `current-weather`, `forecast`, and `uv-index` pages to use the `LoadingController` to create, present, and eventually dismiss a loading indicator. Similar changes will be made to each page and its test.

The `LoadingController` follows a pattern that is common in the Ionic Framework for a type of component called "overlays." The mock package that is supplied with this project contains two mocks we can use to test any overlay component: `createOverlayControllerMock()` which mocks the controller and `createOverlayElementMock()` which mocks the element created by the overlay controller.

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

The test tests should look something like this. Note that the two existing tests are changed to use `fakeAsync` and `tick()`, both of which need to be imported from `@angular/core/testing`. The two test cases that need to be added are "displays a loading indicator" and "dismisses the loading indicator":

```TypeScript
  describe('entering the page', () => {
    beforeEach(() => {
      const weather = TestBed.inject(WeatherService);
      (weather.current as any).and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000),
        }),
      );
    });

    it('displays a loading indicator', fakeAsync(() => {
      const loadingController = TestBed.inject(LoadingController);
      component.ionViewDidEnter();
      tick();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loading.present).toHaveBeenCalledTimes(1);
    }));

    it('gets the current weather', fakeAsync(() => {
      const weather = TestBed.inject(WeatherService);
      component.ionViewDidEnter();
      tick();
      expect(weather.current).toHaveBeenCalledTimes(1);
    }));

    it('displays the current weather', fakeAsync(() => {
      component.ionViewDidEnter();
      tick();
      fixture.detectChanges();
      const t = fixture.debugElement.query(By.css('kws-temperature'));
      expect(t).toBeTruthy();
    }));

    it('dismisses the loading indicator', fakeAsync(() => {
      component.ionViewDidEnter();
      tick();
      expect(loading.dismiss).toHaveBeenCalledTimes(1);
    }));
  });
```

## Code Second

The general pattern for the code is something like this:

```TypeScript
async ionViewDidEnter() {
  const l = await this.loadingController.create({ options });
  await l.present();
  this.weather.someMethod().subscribe(d => {
    this.someData = d;
    l.dismiss();
  });
}
```

You will, of course, need to import the `LoadingController` and inject it into your class. Have a look at the docs for the various options you can use. Make similar changes to all three of the pages.

## Conclusion

This general pattern is often used when displaying overlay elements in Ionic Angular applications.

