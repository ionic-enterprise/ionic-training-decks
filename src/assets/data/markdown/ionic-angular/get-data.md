# Lab: Getting Data

Your app looks nice, but it does not display real data. Let's fix that.

In this lab, you will learn how to:

- Create a new service using the Ionic CLI
- Use Angular's `HttpClient` service to get data from an API
- Transform the data for consumption by your application

## Getting Started

- Use `ionic g service core/tea/tea` to generate a new service called `TeaService`
- Add the new service to the core barrel file

## Inject the HTTP Client

The generated service is just a shell for an injectable class. We need to provide the details. The primary purpose of this service will be to get JSON data from the API via HTTP, so we will need to inject Angular's HTTP client service. Dependency injection in Angular is handled via the constructor. Inject the HTTP client, creating a `private` reference to it.

While we are in there, let's also create stubs for the methods we are going to need.

```TypeScript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';

import { Tea } from '@app/models';

@Injectable({
  providedIn: 'root',
})
export class TeaService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Array<Tea>> {
    return EMPTY;
  }

  get(id: number): Observable<Tea> {
    return EMPTY;
  }
}
```

Angular's <a href="https://angular.io/api/common/http/HttpClient" target="_blank">HttpClient</a> service is very flexible and has several options for working with RESTful data. We will not go into full details, as that could be a full course on its own. You have already seen a couple of cases where we use the POST method to log in and out of the application. In this service we will only be using GET method to retrieve data.

You should see one test failing. That is the test for this service, and it is failing because the testing module does not know how to inject the `HttpClient` service. The `@angular/common/http/testing` library will be used to mock the `HttpClient` for our tests. Some simple setup will fix that.

```TypeScript
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { TeaService } from './tea.service';

describe('TeaService', () => {
  let httpTestingController: HttpTestingController;
  let service: TeaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TeaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## Getting the Data

### Initialize the Test Data

We are going to need some test data. For our application, the data we get back from the server looks like the test data that we provided for the page, only it does not have an image assciated with it. Let's initialize an array of teas called `expectedTeas` using that data.

First, create `expectedTeas` and `resultTeas` variables within the main `describe()` for the test:

```typescript
describe('TeaService', () => {
  let expectedTeas: Array<Tea>;
  let resultTeas: Array<Tea>;
  let httpTestingController: HttpTestingController;
  let service: TeaService;

...
```

We can then use `expectedTeas` to manufacture a set of `resultTeas` by deleting the `image`. The `resultTeas` will be the result of our API call. Create the following function at the bottom of the main `describe()` function callback.

```typescript
function initializeTestData() {
  expectedTeas = [
    {
      id: 1,
      name: 'Green',
      image: 'assets/img/green.jpg',
      description: 'Green tea description.',
    },
    {
      id: 2,
      name: 'Black',
      image: 'assets/img/black.jpg',
      description: 'Black tea description.',
    },
    {
      id: 3,
      name: 'Herbal',
      image: 'assets/img/herbal.jpg',
      description: 'Herbal Infusion description.',
    },
    {
      id: 4,
      name: 'Oolong',
      image: 'assets/img/oolong.jpg',
      description: 'Oolong tea description.',
    },
    {
      id: 5,
      name: 'Dark',
      image: 'assets/img/dark.jpg',
      description: 'Dark tea description.',
    },
    {
      id: 6,
      name: 'Puer',
      image: 'assets/img/puer.jpg',
      description: 'Puer tea description.',
    },
    {
      id: 7,
      name: 'White',
      image: 'assets/img/white.jpg',
      description: 'White tea description.',
    },
    {
      id: 8,
      name: 'Yellow',
      image: 'assets/img/yellow.jpg',
      description: 'Yellow tea description.',
    },
  ];
  resultTeas = expectedTeas.map((t: Tea) => {
    const tea = { ...t };
    delete tea.image;
    return tea;
  });
}
```

Call this function from the main `beforeEach()`.

### Get all of the teas

Create a `describe` for the "get all" functionality. All of our tests for the `getAll()` requirements will go there.

#### Test #1 - Getting Data from the Correct Endpoint

```typescript
it('gets the tea categories', () => {
  service.getAll().subscribe();
  const req = httpTestingController.expectOne(
    `${environment.dataService}/tea-categories`,
  );
  expect(req.request.method).toEqual('GET');
  httpTestingController.verify();
});
```

Write the minimal code required to make that test pass. Basically, this:

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http.get(`${environment.dataService}/tea-categories`) as any;
  }
```

The `as any` is only needed here to make TypeScript happy. It will be removed later.

#### Test #2 - Convert the Data

As sometimes happens, the backend team has not quite figured out how they want to supply the pictures yet, so we will just hook them up based on the ID for now. We have already defined what the API result set looks like and what we expect out of the service.

```typescript
it('adds an image to each', () => {
  let teas: Array<Tea>;
  service.getAll().subscribe(t => (teas = t));
  const req = httpTestingController.expectOne(
    `${environment.dataService}/tea-categories`,
  );
  req.flush(resultTeas);
  httpTestingController.verify();
  expect(teas).toEqual(expectedTeas);
});
```

In our code, we can define an array of images.

```typescript
  private images: Array<string> = [
    'green',
    'black',
    'herbal',
    'oolong',
    'dark',
    'puer',
    'white',
    'yellow',
  ];
```

We can then use the Array `map` operator to convert the individual teas, and the RxJS `map` operator to convert the output of the Observable.

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http.get(`${environment.dataService}/tea-categories`).pipe(
      map((teas: Array<any>) =>
        teas.map(t => ({
          ...t,
          image: `assets/img/${this.images[t.id - 1]}.jpg`,
        })),
      ),
    );
  }
```

### Get one of the teas

The backend has an endpoint that just gets a specific tea category. Create a `describe` for the "get" functionality. All of our tests for the `get()` requirements will go there.

#### Test #1 - Getting Data from the Correct Endpoint

```typescript
it('gets the specific tea category', () => {
  service.get(4).subscribe();
  const req = httpTestingController.expectOne(
    `${environment.dataService}/tea-categories/4`,
  );
  expect(req.request.method).toEqual('GET');
  httpTestingController.verify();
});
```

Write the minimal code required to make that test pass. This will be very similar to what you just did for the `getAll()` so I will not be giving you any code.

#### Test #2 - Convert the Data

The backend team has not quite figured out how they want to supply the pictures yet, so we will just hook them up based on the ID for now. We have already defined what the API result set looks like and what we expect out of the service.

```typescript
it('adds an image to the category', () => {
  let tea: Tea;
  service.get(4).subscribe(t => (tea = t));
  const req = httpTestingController.expectOne(
    `${environment.dataService}/tea-categories/4`,
  );
  req.flush(resultTeas[3]);
  httpTestingController.verify();
  expect(tea).toEqual(expectedTeas[3]);
});
```

Write the minimal code required to make that test pass. Again, since this is so similar to what you did for the `getAll()` I will not be directly giving you any code here.

### Refactor

The code that you have for each of these methods probably looks pretty similar to each other:

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http.get(`${environment.dataService}/tea-categories`).pipe(
      map((teas: Array<any>) =>
        teas.map(t => ({
          ...t,
          image: `assets/img/${this.images[t.id - 1]}.jpg`,
        })),
      ),
    );
  }

  get(id: number): Observable<Tea> {
    return this.http
      .get(`${environment.dataService}/tea-categories/${id}`)
      .pipe(
        map((tea: any) => ({
          ...tea,
          image: `assets/img/${this.images[tea.id - 1]}.jpg`,
        })),
      );
  }
```

Some of this is repeated code is expected since it is a fairly common pattern that is being followed. However, the code that converts from the API data to the `Tea` model by adding an `image` property could be abstracted out to a private method. Do that. When done, your methods should look more like this:

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http
      .get(`${environment.dataService}/tea-categories`)
      .pipe(map((teas: Array<any>) => teas.map(t => this.convert(t))));
  }

  get(id: number): Observable<Tea> {
    return this.http
      .get(`${environment.dataService}/tea-categories/${id}`)
      .pipe(map((tea: any) => this.convert(tea)));
  }
```

Make sure your tests are still passing.

## Conclusion

You have created a service to get the tea data from the server and convert it to the model we use within the application. We will use the data in the next lab.
