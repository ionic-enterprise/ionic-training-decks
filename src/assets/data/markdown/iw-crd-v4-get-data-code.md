# Completed Code for Lab: Getting Data

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `weather.service.spec.ts`

```TypeScript
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { WeatherService } from './weather.service';
import { Forecast } from 'src/app/models/forecast';
import { UVIndex } from 'src/app/models/uv-index';
import { Weather } from 'src/app/models/weather';

describe('WeatherService', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: WeatherService = TestBed.get(WeatherService);
    expect(service).toBeTruthy();
  });

  describe('current', () => {
    it('gets the data from the server', () => {
      const service: WeatherService = TestBed.get(WeatherService);
      service.current().subscribe();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=43.073051&lon=-89.40123&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });

    it('transforms the data', () => {
      const service: WeatherService = TestBed.get(WeatherService);
      let weather: Weather;
      service.current().subscribe(w => (weather = w));
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/weather?lat=43.073051&lon=-89.40123&appid=${
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
    it('gets the data from the server', () => {
      const service: WeatherService = TestBed.get(WeatherService);
      service.forecast().subscribe();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/forecast?lat=43.073051&lon=-89.40123&appid=${
          environment.appId
        }`
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });

    it('transforms the data', () => {
      const service: WeatherService = TestBed.get(WeatherService);
      let forecast: Forecast;
      service.forecast().subscribe(f => (forecast = f));
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/forecast?lat=43.073051&lon=-89.40123&appid=${
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
    it('gets the data from the server', () => {
      const service: WeatherService = TestBed.get(WeatherService);
      service.uvIndex().subscribe();
      const req = httpTestingController.expectOne(
        `${environment.baseUrl}/uvi?lat=43.073051&lon=-89.40123&appid=${
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
      it(`transforms the data - level: ${test.riskLevel}`, () => {
        let uvIndex: UVIndex;
        const service: WeatherService = TestBed.get(WeatherService);
        service.uvIndex().subscribe(u=>uvIndex = u);
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/uvi?lat=43.073051&lon=-89.40123&appid=${
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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Forecast } from '../../models/forecast';
import { Weather } from '../../models/weather';
import { UVIndex } from '../..//models/uv-index';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private latitude = 43.073051;
  private longitude = -89.40123;

  constructor(private http: HttpClient) {}

  current(): Observable<Weather> {
    return this.http
      .get(
        `${environment.baseUrl}/weather?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map((res: any) => this.unpackWeather(res)));
  }

  forecast(): Observable<Forecast> {
    return this.http
      .get(
        `${environment.baseUrl}/forecast?lat=${this.latitude}&lon=${
          this.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map((res: any) => this.unpackForecast(res)));
  }

  uvIndex(): Observable<UVIndex> {
    return this.http
      .get(
        `${environment.baseUrl}/uvi?lat=${this.latitude}&lon=${this.longitude}&appid=${
          environment.appId
        }`
      )
      .pipe(map((res: any) => this.unpackUvIndex(res)));
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
      riskLevel: this.riskLevel(res.value)
    };
  }

  private riskLevel(value: number): number {
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