# Completed Code for Lab: Using Plugins

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `location.service.spec.ts`

```TypeScript
import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { createPlatformMock } from '../../../../test/mocks';

import { LocationService } from './location.service';

describe('LocationService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useFactory: createPlatformMock },
        {
          provide: Geolocation,
          useFactory: () =>
            jasmine.createSpyObj('Geolocation', {
              getCurrentPosition: Promise.resolve({
                coords: { latitude: 42, longitude: 73 }
              })
            })
        }
      ]
    })
  );

  it('should be created', () => {
    const service: LocationService = TestBed.get(LocationService);
    expect(service).toBeTruthy();
  });

  describe('current', () => {
    it('determines if the appliction is hybrid native or not', () => {
      const platform = TestBed.get(Platform);
      const service: LocationService = TestBed.get(LocationService);
      service.current();
      expect(platform.is).toHaveBeenCalledTimes(1);
      expect(platform.is).toHaveBeenCalledWith('cordova');
    });

    describe('when hybrid mobile', () => {
      beforeEach(() => {
        const platform = TestBed.get(Platform);
        platform.is.withArgs('cordova').and.returnValue(true);
      });

      it('calls the gelocation plugin', () => {
        const geolocation = TestBed.get(Geolocation);
        const service: LocationService = TestBed.get(LocationService);
        service.current();
        expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      });

      it('resolves the unpacked position', async () => {
        const service: LocationService = TestBed.get(LocationService);
        expect(await service.current()).toEqual({
          latitude: 42,
          longitude: 73
        });
      });
    });

    describe('when not hybrid mobile', () => {
      it('does not call the gelocation plugin', () => {
        const geolocation = TestBed.get(Geolocation);
        const service: LocationService = TestBed.get(LocationService);
        service.current();
        expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
      });

      it('resolves the default position', async () => {
        const service: LocationService = TestBed.get(LocationService);
        expect(await service.current()).toEqual({
          latitude: 43.073051,
          longitude: -89.40123
        });
      });
    });
  });
});
```

## `location.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';

import { Coordinate } from '../../models/coordinate';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private defaultLocation = {
    coords: {
      latitude: 43.073051,
      longitude: -89.40123
    }
  };

  private cachedLocation;

  constructor(private geolocation: Geolocation, private platform: Platform) {}

  async current(): Promise<Coordinate> {
    const loc =
      this.cachedLocation ||
      (this.platform.is('cordova')
        ? await this.geolocation.getCurrentPosition()
        : this.defaultLocation);
    this.cachedLocation = loc;
    return {
      longitude: loc.coords.longitude,
      latitude: loc.coords.latitude
    };
  }
}
```

## `weather.service.spec.ts`

```TypeScript
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { createLocationServiceMock } from '../location/location.service.mock';

import { environment } from '../../../environments/environment';
import { Forecast } from '../../models/forecast';
import { LocationService } from '../location/location.service';
import { Weather } from '../../models/weather';
import { WeatherService } from './weather.service';
import { UVIndex } from 'src/app/models/uv-index';

describe('WeatherService', () => {
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: LocationService, useFactory: createLocationServiceMock }
      ]
    });
    httpTestingController = TestBed.get(HttpTestingController);
    const loc = TestBed.get(LocationService);
    loc.current.and.returnValue(
      Promise.resolve({ latitude: 42.731338, longitude: -88.314159 })
    );
  });

  it('should be created', () => {
    const service: WeatherService = TestBed.get(WeatherService);
    expect(service).toBeTruthy();
  });

  describe('current', () => {
    it('gets the current location', () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.current().subscribe();
      expect(loc.current).toHaveBeenCalledTimes(1);
    });

    it('gets the data from the server', fakeAsync(() => {
      const service: WeatherService = TestBed.get(WeatherService);
      service.current().subscribe();
      tick();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=42.731338&lon=-88.314159&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    }));

    it('transforms the data', fakeAsync (() => {
      const service: WeatherService = TestBed.get(WeatherService);
      let weather: Weather;
      service.current().subscribe(w => (weather = w));
      tick();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=42.731338&lon=-88.314159&appid=${
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
    }));
  });

  describe('forecast', () => {
    it('gets the current location', () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.forecast().subscribe();
      expect(loc.current).toHaveBeenCalledTimes(1);
    });

    it('gets the data from the server', fakeAsync(() => {
      const service: WeatherService = TestBed.get(WeatherService);
      service.forecast().subscribe();
      tick();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/forecast?lat=42.731338&lon=-88.314159&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    }));

    it('transforms the data', fakeAsync(() => {
      const service: WeatherService = TestBed.get(WeatherService);
      let forecast: Forecast;
      service.forecast().subscribe(f => (forecast = f));
      tick();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/forecast?lat=42.731338&lon=-88.314159&appid=${
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
          }
        ]
      });
      httpTestingController.verify();
      expect(forecast).toEqual([
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
    }));
  });

  describe('UV Index', () => {
    it('gets the current location', () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.uvIndex().subscribe();
      expect(loc.current).toHaveBeenCalledTimes(1);
    });

    it('gets the data from the server', fakeAsync(() => {
      const service: WeatherService = TestBed.get(WeatherService);
      service.uvIndex().subscribe();
      tick();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/uvi?lat=42.731338&lon=-88.314159&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    }));

    [
      { value: 0, level: 0 },
      { value: 2.9, level: 0 },
      { value: 3, level: 1 },
      { value: 5.9, level: 1 },
      { value: 6, level: 2 },
      { value: 7.9, level: 2 },
      { value: 8, level: 3 },
      { value: 10.9, level: 3 },
      { value: 11, level: 4 },
      { value: 18, level: 4 }
    ].forEach(test =>
      it(`transforms the data for value  ${test.value}`,fakeAsync( () => {
        const service: WeatherService = TestBed.get(WeatherService);
        let uvIndex: UVIndex;
        service.uvIndex().subscribe(i => (uvIndex = i));
        tick();
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/uvi?lat=42.731338&lon=-88.314159&appid=${
            environment.appId
          }`
        );
        req.flush({ value: test.value });
        httpTestingController.verify();
        expect(uvIndex).toEqual({
          value: test.value,
          riskLevel: test.level
        });
      }))
    );
  });
});
```

## `weather.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { Coordinate } from '../../models/coordinate';
import { environment } from '../../../environments/environment.prod';
import { Forecast } from '../../models/forecast';
import { Weather } from '../../models/weather';
import { UVIndex } from '../../models/uv-index';
import { LocationService } from '../location/location.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private latitude = 43.073051;
  private longitude = -89.40123;

  constructor(private http: HttpClient, private location: LocationService) {}

  current(): Observable<Weather> {
    return this.getCurrentLocation().pipe(
      flatMap((coord: Coordinate) => this.getCurrentWeather(coord))
    );
  }

  forecast(): Observable<Forecast> {
    return this.getCurrentLocation().pipe(
      flatMap((coord: Coordinate) => this.getForecast(coord))
    );
  }

  uvIndex(): Observable<UVIndex> {
    return this.getCurrentLocation().pipe(
      flatMap((coord: Coordinate) => this.getUvIndex(coord))
    );
  }

  private getCurrentLocation(): Observable<Coordinate> {
    return from(this.location.current());
  }

  private getCurrentWeather(coord: Coordinate): Observable<Weather> {
    return this.http
      .get(
        `${environment.baseUrl}/weather?lat=${coord.latitude}&lon=${
          coord.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map(res => this.unpackWeather(res)));
  }

  private getForecast(coord: Coordinate): Observable<Forecast> {
    return this.http
      .get(
        `${environment.baseUrl}/forecast?lat=${coord.latitude}&lon=${
          coord.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map(res => this.unpackForecast(res)));
  }

  private getUvIndex(coord: Coordinate): Observable<UVIndex> {
    return this.http
      .get(
        `${environment.baseUrl}/uvi?lat=${coord.latitude}&lon=${
          coord.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map(res => this.unpackUvIndex(res)));
  }

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

  private unpackUvIndex(res: any): UVIndex {
    return {
      value: res.value,
      riskLevel: this.risk(res.value)
    };
  }

  private risk(value: number): number {
    if (value < 3) {
      return 0;
    }
    if (value < 6) {
      return 1;
    }
    if (value < 8) {
      return 2;
    }
    if (value < 11) {
      return 3;
    }
    return 4;
  }

  private unpackWeather(res: any): Weather {
    return {
      temperature: res.main.temp,
      condition: res.weather[0].id,
      date: new Date(res.dt * 1000)
    };
  }
}
```