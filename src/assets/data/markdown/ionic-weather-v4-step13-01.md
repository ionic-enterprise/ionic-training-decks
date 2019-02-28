# Completed Code for Lab: User Preferences Phase 2

Please try to write this code on your own before consulting this part of the guide. Your code may look different, just make sure it is functionally the same.

## `user-preferences.service.spec.ts`

```TypeScript
import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage';

import { cities } from './cities';
import { UserPreferencesService } from './user-preferences.service';

describe('UserPreferencesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: Storage, useFactory: createIonicStorageMock }]
    })
  );

  it('should be created', () => {
    const service: UserPreferencesService = TestBed.get(UserPreferencesService);
    expect(service).toBeTruthy();
  });

  describe('availableCities', () => {
    it('returns the list of available cities', () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      expect(service.availableCities()).toEqual(cities);
    });
  });

  describe('getUseCelcius', () => {
    it('waits for storage to be ready', () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      service.getUseCelcius();
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });

    it('gets the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.getUseCelcius();
      expect(storage.get).toHaveBeenCalledTimes(1);
      expect(storage.get).toHaveBeenCalledWith('useCelcius');
    });

    it('resolves the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      storage.get.withArgs('useCelcius').and.returnValue(Promise.resolve(true));
      expect(await service.getUseCelcius()).toEqual(true);
    });

    it('caches the resolved useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      storage.get.withArgs('useCelcius').and.returnValue(Promise.resolve(true));
      expect(await service.getUseCelcius()).toEqual(true);
      expect(await service.getUseCelcius()).toEqual(true);
      expect(await service.getUseCelcius()).toEqual(true);
      expect(storage.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('setUseCelcius', () => {
    it('waits for storage to be ready', () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      service.setUseCelcius(false);
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });

    it('sets the useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.setUseCelcius(false);
      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith('useCelcius', false);
    });

    it('updates the cache value for useCelcius', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.setUseCelcius(false);
      expect(await service.getUseCelcius()).toEqual(false);
      expect(storage.get).not.toHaveBeenCalled();
    });

    it('triggers changed', async () => {
      let changed = false;
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      service.changed.subscribe(() => changed = true);
      await service.setUseCelcius(false);
      expect(changed).toEqual(true);
    });
  });

  describe('getCity', () => {
    it('waits for storage to be ready', () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      service.getCity();
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });

    it('gets the city value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.getCity();
      expect(storage.get).toHaveBeenCalledTimes(1);
      expect(storage.get).toHaveBeenCalledWith('city');
    });

    it('resolves the city value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      storage.get.withArgs('city').and.returnValue(Promise.resolve({ ...cities[1] }));
      expect(await service.getCity()).toBe(cities[1]);
    });

    it('resolves the first city if there is no stored value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      expect(await service.getCity()).toBe(cities[0]);
    });

    it('caches the resolved useCelcius value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      storage.get.withArgs('city').and.returnValue(Promise.resolve({ ...cities[3] }));
      expect(await service.getCity()).toBe(cities[3]);
      expect(await service.getCity()).toBe(cities[3]);
      expect(await service.getCity()).toBe(cities[3]);
      expect(storage.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('setCity', () => {
    it('waits for storage to be ready', () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      service.setCity(cities[2]);
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });

    it('sets the city value', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.setCity(cities[2]);
      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith('city', cities[2]);
    });

    it('updates the cache value for useCelcius', async () => {
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      const storage = TestBed.get(Storage);
      await service.setCity(cities[2]);
      expect(await service.getCity()).toEqual(cities[2]);
      expect(storage.get).not.toHaveBeenCalled();
    });

    it('triggers changed', async () => {
      let changed = false;
      const service: UserPreferencesService = TestBed.get(
        UserPreferencesService
      );
      service.changed.subscribe(() => changed = true);
      await service.setCity(cities[2]);
      expect(changed).toEqual(true);
    });
  });
});

function createIonicStorageMock() {
  return jasmine.createSpyObj('Platform', {
    get: Promise.resolve(),
    set: Promise.resolve(),
    ready: Promise.resolve()
  });
}
```

## `user-preferences.service.ts`

```TypeScript
import { City } from 'src/app/models/city';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { cities } from './cities';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private useCelcius: boolean;
  private city: City;

  private keys = {
    city: 'city',
    useCelcius: 'useCelcius'
  };

  changed: Subject<void>;

  constructor(private storage: Storage) {
    this.changed = new Subject();
  }

  availableCities(): Array<City> {
    return cities;
  }

  async getUseCelcius(): Promise<boolean> {
    await this.storage.ready();
    if (this.useCelcius === undefined) {
      this.useCelcius = await this.storage.get(this.keys.useCelcius);
    }
    return this.useCelcius;
  }

  async setUseCelcius(value: boolean): Promise<void> {
    await this.storage.ready();
    this.useCelcius = value;
    await this.storage.set(this.keys.useCelcius, value);
    this.changed.next();
  }

  async getCity(): Promise<City> {
    await this.storage.ready();
    if (this.city === undefined) {
      const city = await this.storage.get(this.keys.city);
      this.city = cities.find(c => city && city.name === c.name) || cities[0];
    }
    return this.city;
  }

  async setCity(value: City): Promise<void> {
    await this.storage.ready();
    this.city = value;
    await this.storage.set(this.keys.city, value);
    this.changed.next();
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
import { createUserPreferencesServiceMock } from '../user-preferences/user-preferences.service.mock';
import { LocationService } from '../location/location.service';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';

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
        { provide: LocationService, useFactory: createLocationServiceMock },
        {
          provide: UserPreferencesService,
          useFactory: createUserPreferencesServiceMock
        }
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
    it('gets the city specified by the user preferences', () => {
      const userPreferences = TestBed.get(UserPreferencesService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.current().subscribe();
      expect(userPreferences.getCity).toHaveBeenCalledTimes(1);
    });

    describe('for the current location', () => {
      beforeEach(() => {
        const userPreferences = TestBed.get(UserPreferencesService);
        userPreferences.getCity.and.returnValue(
          Promise.resolve({ name: 'Current Location' })
        );
      });

      it('gets the current location', fakeAsync(() => {
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.current().subscribe();
        tick();
        expect(loc.current).toHaveBeenCalledTimes(1);
      }));

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
    });

    describe('with a selected city', () => {
      beforeEach(() => {
        const userPreferences = TestBed.get(UserPreferencesService);
        userPreferences.getCity.and.returnValue(
          Promise.resolve({
            name: 'Edmonton, AB',
            coordinate: { latitude: 53.544388, longitude: -113.490929 }
          })
        );
      });

      it('does not get the current location', fakeAsync(() => {
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.current().subscribe();
        tick();
        expect(loc.current).not.toHaveBeenCalled();
      }));

      it('gets the data from the server', fakeAsync(() => {
        const service: WeatherService = TestBed.get(WeatherService);
        service.current().subscribe();
        tick();
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/weather?lat=53.544388&lon=-113.490929&appid=${
            environment.appId
          }`
        );
        expect(req.request.method).toEqual('GET');
        httpTestingController.verify();
      }));
    });

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
    it('gets the city specified by the user preferences', () => {
      const userPreferences = TestBed.get(UserPreferencesService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.forecast().subscribe();
      expect(userPreferences.getCity).toHaveBeenCalledTimes(1);
    });

    describe('for the current location', () => {
      beforeEach(() => {
        const userPreferences = TestBed.get(UserPreferencesService);
        userPreferences.getCity.and.returnValue(
          Promise.resolve({ name: 'Current Location' })
        );
      });

      it('gets the current location', fakeAsync(() => {
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.forecast().subscribe();
        tick();
        expect(loc.current).toHaveBeenCalledTimes(1);
      }));

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
    });

    describe('with a selected city', () => {
      beforeEach(() => {
        const userPreferences = TestBed.get(UserPreferencesService);
        userPreferences.getCity.and.returnValue(
          Promise.resolve({
            name: 'Edmonton, AB',
            coordinate: { latitude: 53.544388, longitude: -113.490929 }
          })
        );
      });

      it('does not get the current location', fakeAsync(() => {
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.forecast().subscribe();
        tick();
        expect(loc.current).not.toHaveBeenCalled();
      }));

      it('gets the data from the server', fakeAsync(() => {
        const service: WeatherService = TestBed.get(WeatherService);
        service.forecast().subscribe();
        tick();
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/forecast?lat=53.544388&lon=-113.490929&appid=${
            environment.appId
          }`
        );
        expect(req.request.method).toEqual('GET');
        httpTestingController.verify();
      }));
    });

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
    it('gets the city specified by the user preferences', () => {
      const userPreferences = TestBed.get(UserPreferencesService);
      const service: WeatherService = TestBed.get(WeatherService);
      service.uvIndex().subscribe();
      expect(userPreferences.getCity).toHaveBeenCalledTimes(1);
    });

    describe('for the current location', () => {
      beforeEach(() => {
        const userPreferences = TestBed.get(UserPreferencesService);
        userPreferences.getCity.and.returnValue(
          Promise.resolve({ name: 'Current Location' })
        );
      });

      it('gets the current location', fakeAsync(() => {
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.uvIndex().subscribe();
        tick();
        expect(loc.current).toHaveBeenCalledTimes(1);
      }));

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
    });

    describe('with a selected city', () => {
      beforeEach(() => {
        const userPreferences = TestBed.get(UserPreferencesService);
        userPreferences.getCity.and.returnValue(
          Promise.resolve({
            name: 'Edmonton, AB',
            coordinate: { latitude: 53.544388, longitude: -113.490929 }
          })
        );
      });

      it('does not get the current location', fakeAsync(() => {
        const loc = TestBed.get(LocationService);
        const service: WeatherService = TestBed.get(WeatherService);
        service.uvIndex().subscribe();
        tick();
        expect(loc.current).not.toHaveBeenCalled();
      }));

      it('gets the data from the server', fakeAsync(() => {
        const service: WeatherService = TestBed.get(WeatherService);
        service.uvIndex().subscribe();
        tick();
        const req = httpTestingController.expectOne(
          `${environment.baseUrl}/uvi?lat=53.544388&lon=-113.490929&appid=${
            environment.appId
          }`
        );
        expect(req.request.method).toEqual('GET');
        httpTestingController.verify();
      }));
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

import { Injectable } from '@angular/core';
## `weather.service.ts`

```TypeScript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Coordinate } from '../../models/coordinate';
import { Forecast } from '../../models/forecast';
import { UVIndex } from '../../models/uv-index';
import { Weather } from '../../models/weather';
import { LocationService } from '../location/location.service';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(
    private http: HttpClient,
    private location: LocationService,
    private userPreferences: UserPreferencesService
  ) {}

  current(): Observable<Weather> {
    return this.getCurrentLoction().pipe(
      flatMap((coord: Coordinate) => this.getCurrentWeather(coord))
    );
  }

  forecast(): Observable<Forecast> {
    return this.getCurrentLoction().pipe(
      flatMap((coord: Coordinate) => this.getForecast(coord))
    );
  }

  uvIndex(): Observable<UVIndex> {
    return this.getCurrentLoction().pipe(
      flatMap((coord: Coordinate) => this.getUVIndex(coord))
    );
  }

  private getCurrentLoction(): Observable<Coordinate> {
    return from(
      this.userPreferences
        .getCity()
        .then(city =>
          city && city.coordinate
            ? Promise.resolve(city.coordinate)
            : this.location.current()
        )
    );
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

  private getUVIndex(coord: Coordinate): Observable<UVIndex> {
    return this.http
      .get(
        `${environment.baseUrl}/uvi?lat=${coord.latitude}&lon=${
          coord.longitude
        }&appid=${environment.appId}`
      )
      .pipe(map(res => this.unpackUVIndex(res)));
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

  private unpackUVIndex(res: any): UVIndex {
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

## `user-preferences.component.spec.ts`

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { createOverlayControllerMock } from '../../../test/mocks';
import { createUserPreferencesServiceMock } from '../services/user-preferences/user-preferences.service.mock';

import { UserPreferencesComponent } from './user-preferences.component';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

describe('UserPreferencesPage', () => {
  let component: UserPreferencesComponent;
  let fixture: ComponentFixture<UserPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserPreferencesComponent],
      providers: [
        {
          provide: ModalController,
          useFactory: () => createOverlayControllerMock('ModalController')
        },
        {
          provide: UserPreferencesService,
          useFactory: createUserPreferencesServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPreferencesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('on view create', async () => {
    it('gets all cities', async () => {
      const ups = TestBed.get(UserPreferencesService);
      await component.ngOnInit();
      expect(ups.availableCities).toHaveBeenCalledTimes(1);
      expect(component.cities).toEqual(ups.availableCities());
    });

    it('gets the use celcius setting', async () => {
      const ups = TestBed.get(UserPreferencesService);
      ups.getUseCelcius.and.returnValue(Promise.resolve(true));
      await component.ngOnInit();
      expect(ups.getUseCelcius).toHaveBeenCalledTimes(1);
      expect(component.useCelcius).toEqual(true);
    });

    it('gets the city', async () => {
      const ups = TestBed.get(UserPreferencesService);
      const cities = ups.availableCities();
      ups.getCity.and.returnValue(Promise.resolve(cities[2]));
      await component.ngOnInit();
      expect(ups.getCity).toHaveBeenCalledTimes(1);
      expect(component.city).toEqual(cities[2]);
    });
  });

  describe('dismiss', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('dismisses the modal', () => {
      const modalController = TestBed.get(ModalController);
      component.dismiss();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('sets the city', async () => {
      component.city = component.cities[3];
      const ups = TestBed.get(UserPreferencesService);
      await component.save();
      expect(ups.setCity).toHaveBeenCalledTimes(1);
      expect(ups.setCity).toHaveBeenCalledWith(component.cities[3]);
    });

    it('sets the use celcius flag', async () => {
      component.useCelcius = true;
      const ups = TestBed.get(UserPreferencesService);
      await component.save();
      expect(ups.setUseCelcius).toHaveBeenCalledTimes(1);
      expect(ups.setUseCelcius).toHaveBeenCalledWith(true);
    });

    it('dismisses the modal', async () => {
      const modalController = TestBed.get(ModalController);
      await component.save();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
});
```

## `user-preferences.component.ts`

```TypeScript
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { City } from '../models/city';
import { cities } from '../services/user-preferences/cities';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {
  cities: Array<City>;
  city: City;
  useCelcius: boolean;

  constructor(
    private modalController: ModalController,
    private userPreferencesService: UserPreferencesService
  ) {}

  async ngOnInit() {
    this.cities = this.userPreferencesService.availableCities();
    this.city = await this.userPreferencesService.getCity();
    this.useCelcius = await this.userPreferencesService.getUseCelcius();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    this.userPreferencesService.setCity(this.city);
    this.userPreferencesService.setUseCelcius(this.useCelcius);
    this.modalController.dismiss();
  }
}
```

## `current-weather.page.spec.ts`

Other pages are similar in concept.

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { LoadingController, ModalController } from '@ionic/angular';
import { of } from 'rxjs';

import {
  createOverlayControllerMock,
  createOverlayElementMock
} from '../../../test/mocks';
import { createUserPreferencesServiceMock } from '../services/user-preferences/user-preferences.service.mock';

import { CurrentWeatherPage } from './current-weather.page';
import { createWeatherServiceMock } from '../services/weather/weather.service.mock';
import { WeatherService } from '../services/weather/weather.service';
import { UserPreferencesComponent } from '../user-preferences/user-preferences.component';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

describe('CurrentWeatherPage', () => {
  let component: CurrentWeatherPage;
  let fixture: ComponentFixture<CurrentWeatherPage>;
  let loading;
  let modal;

  beforeEach(async(() => {
    loading = createOverlayElementMock('Loading');
    modal = createOverlayElementMock('Modal');
    TestBed.configureTestingModule({
      declarations: [CurrentWeatherPage],
      providers: [
        { provide: WeatherService, useFactory: createWeatherServiceMock },
        {
          provide: LoadingController,
          useFactory: () =>
            createOverlayControllerMock('LoadingController', loading)
        },
        {
          provide: ModalController,
          useFactory: () =>
            createOverlayControllerMock('ModalController', modal)
        },
        {
          provide: UserPreferencesService,
          useFactory: createUserPreferencesServiceMock
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    const ups = TestBed.get(UserPreferencesService);
    ups.getCity.and.returnValue(Promise.resolve({ name: 'Unavailable' }));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentWeatherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('entering the page', () => {
    it('displays a loading indicator', async () => {
      const loadingController = TestBed.get(LoadingController);
      await component.ionViewDidEnter();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Checking the weather'
      });
      expect(loading.present).toHaveBeenCalledTimes(1);
    });

    it('gets the user selected city', async () => {
      const ups = TestBed.get(UserPreferencesService);
      ups.getCity.and.returnValue(Promise.resolve({ name: 'Mad City' }));
      await component.ionViewDidEnter();
      expect(ups.getCity).toHaveBeenCalledTimes(1);
      expect(component.cityName).toEqual('Mad City');
    });

    it('sets the scale to "C" if we are to use celcius', async () => {
      const ups = TestBed.get(UserPreferencesService);
      ups.getUseCelcius.and.returnValue(Promise.resolve(true));
      await component.ionViewDidEnter();
      expect(ups.getUseCelcius).toHaveBeenCalledTimes(1);
      expect(component.scale).toEqual('C');
    });

    it('sets the scale to "F" if we are not to use celcius', async () => {
      const ups = TestBed.get(UserPreferencesService);
      ups.getUseCelcius.and.returnValue(Promise.resolve(false));
      await component.ionViewDidEnter();
      expect(ups.getUseCelcius).toHaveBeenCalledTimes(1);
      expect(component.scale).toEqual('F');
    });

    it('gets the current weather', async () => {
      const weather = TestBed.get(WeatherService);
      await component.ionViewDidEnter();
      expect(weather.current).toHaveBeenCalledTimes(1);
    });

    it('assigns the current weather', async () => {
      const weather = TestBed.get(WeatherService);
      weather.current.and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000)
        })
      );
      await component.ionViewDidEnter();
      expect(component.data).toEqual({
        temperature: 280.32,
        condition: 300,
        date: new Date(1485789600 * 1000)
      });
    });

    it('dismisses a loading indicator', async () => {
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

  describe('when the user preferences change', () => {
    it('displays a loading indicator', fakeAsync(() => {
      const loadingController = TestBed.get(LoadingController);
      const ups = TestBed.get(UserPreferencesService);
      ups.changed.next();
      tick();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Checking the weather'
      });
      expect(loading.present).toHaveBeenCalledTimes(1);
    }));

    it('gets the user selected city', fakeAsync(() => {
      const ups = TestBed.get(UserPreferencesService);
      ups.getCity.and.returnValue(Promise.resolve({ name: 'Mad City' }));
      ups.changed.next();
      tick();
      expect(ups.getCity).toHaveBeenCalledTimes(1);
      expect(component.cityName).toEqual('Mad City');
    }));

    it('sets the scale to "C" if we are to use celcius', fakeAsync(() => {
      const ups = TestBed.get(UserPreferencesService);
      ups.getUseCelcius.and.returnValue(Promise.resolve(true));
      ups.changed.next();
      tick();
      expect(ups.getUseCelcius).toHaveBeenCalledTimes(1);
      expect(component.scale).toEqual('C');
    }));

    it('sets the scale to "F" if we are not to use celcius', fakeAsync(() => {
      const ups = TestBed.get(UserPreferencesService);
      ups.getUseCelcius.and.returnValue(Promise.resolve(false));
      ups.changed.next();
      tick();
      expect(ups.getUseCelcius).toHaveBeenCalledTimes(1);
      expect(component.scale).toEqual('F');
    }));

    it('gets the current weather', fakeAsync(() => {
      const ups = TestBed.get(UserPreferencesService);
      const weather = TestBed.get(WeatherService);
      ups.changed.next();
      tick();
      expect(weather.current).toHaveBeenCalledTimes(1);
    }));

    it('assigns the current weather', fakeAsync(() => {
      const weather = TestBed.get(WeatherService);
      weather.current.and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000)
        })
      );
      const ups = TestBed.get(UserPreferencesService);
      ups.changed.next();
      tick();
      expect(component.data).toEqual({
        temperature: 280.32,
        condition: 300,
        date: new Date(1485789600 * 1000)
      });
    }));

    it('dismisses a loading indicator', fakeAsync(() => {
      const weather = TestBed.get(WeatherService);
      weather.current.and.returnValue(
        of({
          temperature: 280.32,
          condition: 300,
          date: new Date(1485789600 * 1000)
        })
      );
      const ups = TestBed.get(UserPreferencesService);
      ups.changed.next();
      tick();
      expect(loading.dismiss).toHaveBeenCalledTimes(1);
    }));
  });

  describe('opening the user preferences dialog', () => {
    it('creates the modal', () => {
      const modalController = TestBed.get(ModalController);
      component.openUserPreferences();
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: UserPreferencesComponent
      });
    });

    it('presents the modal', async () => {
      await component.openUserPreferences();
      expect(modal.present).toHaveBeenCalledTimes(1);
    });
  });
});
```

## `current-weather.page.ts`

Other pages are similar in concept.

```TypeScript
import { Component } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';

import { IconMapService } from '../services/icon-map/icon-map.service';
import { Weather } from '../models/weather';
import { WeatherPageBase } from '../weather-page-base/weather-page-base';
import { WeatherService } from '../services/weather/weather.service';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

@Component({
  selector: 'app-current-weather',
  templateUrl: 'current-weather.page.html',
  styleUrls: ['current-weather.page.scss']
})
export class CurrentWeatherPage extends WeatherPageBase<Weather> {
  constructor(
    public iconMap: IconMapService,
    loadingController: LoadingController,
    modalController: ModalController,
    userPreferences: UserPreferencesService,
    weather: WeatherService
  ) {
    super(loadingController, modalController, userPreferences, () =>
      weather.current()
    );
  }
}
```

## `weather-page-base.ts`

```TypeScript
import { OnDestroy, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';

import { UserPreferencesComponent } from '../user-preferences/user-preferences.component';
import { UserPreferencesService } from '../services/user-preferences/user-preferences.service';

export class WeatherPageBase<T> implements OnInit, OnDestroy {
  private subscription: Subscription;

  cityName: string;
  data: T;
  scale: string;

  constructor(
    private loadingController: LoadingController,
    private modalController: ModalController,
    private userPreferences: UserPreferencesService,
    private fetch: () => Observable<T>
  ) {}

  ngOnInit() {
    this.subscription = this.userPreferences.changed.subscribe(() =>
      this.getData()
    );
  }

  async ionViewDidEnter() {
    return this.getData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async openUserPreferences(): Promise<void> {
    const modal = await this.modalController.create({
      component: UserPreferencesComponent
    });
    modal.present();
  }

  private async getData(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Checking the weather'
    });
    loading.present();
    this.cityName = (await this.userPreferences.getCity()).name;
    this.scale = (await this.userPreferences.getUseCelcius()) ? 'C' : 'F';
    this.fetch().subscribe(w => {
      this.data = w;
      loading.dismiss();
    });
  }
}
```
