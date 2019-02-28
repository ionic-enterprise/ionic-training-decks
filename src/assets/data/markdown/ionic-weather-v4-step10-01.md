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
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { createLocationServiceMock } from '../location/location.service.mock';
import { LocationService } from '../location/location.service';

import { environment } from '../../../environments/environment';
import { WeatherService } from './weather.service';
import { Forecast } from 'src/app/models/forecast';
import { UVIndex } from 'src/app/models/uv-index';
import { Weather } from 'src/app/models/weather';

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
      Promise.resolve({ latitude: 42.731138, longitude: -88.314159 })
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

    it('gets the data from the server', async () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.current().subscribe();
      await loc.current();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=42.731138&lon=-88.314159&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });

    it('transforms the data', async () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      let weather: Weather;
      service.current().subscribe(w => (weather = w));
      await loc.current();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=42.731138&lon=-88.314159&appid=${
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
  });

  describe('forecast', () => {
    it('gets the current location', () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.forecast().subscribe();
      expect(loc.current).toHaveBeenCalledTimes(1);
    });

    it('gets the data from the server', async () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.forecast().subscribe();
      await loc.current();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/forecast?lat=42.731138&lon=-88.314159&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });

    it('transforms the data', async () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      let forecast: Forecast;
      service.forecast().subscribe(f => (forecast = f));
      await loc.current();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/forecast?lat=42.731138&lon=-88.314159&appid=${
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
    });
  });

  describe('uv index', () => {
    it('gets the current location', () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.uvIndex().subscribe();
      expect(loc.current).toHaveBeenCalledTimes(1);
    });

    it('gets the data from the server', async () => {
      const loc = TestBed.get(LocationService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.uvIndex().subscribe();
      await loc.current();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/uvi?lat=42.731138&lon=-88.314159&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });

    [
      {
        value: 2.9,
        riskLevel: 0
      },
      {
        value: 3,
        riskLevel: 1
      },
      {
        value: 6,
        riskLevel: 2
      },
      {
        value: 8,
        riskLevel: 3
      },
      {
        value: 11,
        riskLevel: 4
      }
    ].forEach(test => {
      it(`transforms the data - level: ${test.riskLevel}`, async () => {
        let uvIndex: UVIndex;
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.uvIndex().subscribe(u => (uvIndex = u));
        await loc.current();
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/uvi?lat=42.731138&lon=-88.314159&appid=${
            environment.appId
          }`
        );
        req.flush({ value: test.value });
        expect(uvIndex).toEqual(test);
        httpTestingController.verify();
      });
    });
  });
});
```

## `weather.service.ts`

```TypeScript
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { createLocationServiceMock } from '../location/location.service.mock';
import { LocationService } from '../location/location.service';

import { environment } from '../../../environments/environment';
import { WeatherService } from './weather.service';
import { Forecast } from 'src/app/models/forecast';
import { UVIndex } from 'src/app/models/uv-index';
import { Weather } from 'src/app/models/weather';

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
      Promise.resolve({ latitude: 42.731138, longitude: -88.314159 })
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
        `${environment.baseUrl}/weather?lat=42.731138&lon=-88.314159&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    }));

    it('transforms the data', fakeAsync(() => {
      const service: WeatherService = TestBed.get(WeatherService);
      let weather: Weather;
      service.current().subscribe(w => (weather = w));
      tick();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=42.731138&lon=-88.314159&appid=${
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
        `${environment.baseUrl}/forecast?lat=42.731138&lon=-88.314159&appid=${
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
        `${environment.baseUrl}/forecast?lat=42.731138&lon=-88.314159&appid=${
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

  describe('uv index', () => {
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
        `${environment.baseUrl}/uvi?lat=42.731138&lon=-88.314159&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    }));

    [
      {
        value: 2.9,
        riskLevel: 0
      },
      {
        value: 3,
        riskLevel: 1
      },
      {
        value: 6,
        riskLevel: 2
      },
      {
        value: 8,
        riskLevel: 3
      },
      {
        value: 11,
        riskLevel: 4
      }
    ].forEach(test => {
      it(`transforms the data - level: ${test.riskLevel}`, fakeAsync(() => {
        let uvIndex: UVIndex;
        const service: WeatherService = TestBed.get(WeatherService);
        service.uvIndex().subscribe(u => (uvIndex = u));
        tick();
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/uvi?lat=42.731138&lon=-88.314159&appid=${
            environment.appId
          }`
        );
        req.flush({ value: test.value });
        expect(uvIndex).toEqual(test);
        httpTestingController.verify();
      }));
    });
  });
});
```
