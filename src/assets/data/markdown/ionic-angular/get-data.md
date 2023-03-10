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

While we are in there, let's also create a stub for the method we are going to need.

**A note on method naming:** I generally use the same method names across all of my data services as such:

- `getAll()` - get all items
- `get(id)` - get a specific item
- `save(obj)` - save and existing item or create add a new one, depending on whether an ID exists on the object or not, return the saved object
- `delete(obj)` - delete the object

Not every service has all of these methods, but when a data service needs a specific method these are the names that I use. The details here are not quite as important as making sure you develop a standard and then enforce it across your data services.

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
}
```

Angular's <a href="https://angular.io/api/common/http/HttpClient" target="_blank">HttpClient</a> service is very flexible and has several options for working with RESTful data. We will not go into full details, as that could be a full course on its own. You have already seen a couple of cases where we use the POST method to log in and out of the application. In this service we will only be using GET method to retrieve data.

You should see one test failing (note that since we added a test file you will likely need to restart the Angular testing service). That is the test for this service, and it is failing because the testing module does not know how to inject the `HttpClient` service. The `@angular/common/http/testing` library will be used to mock the `HttpClient` for our tests. Here is the configuration needed to rectify that:

```TypeScript
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { environment } from '@env/environment';
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

**Note:** this is just a reminder that as you go through these steps you will need to adjust your imports, importing in new items that you are using and remove items that are no longer being used. In some cases, multiple modules will contain an object with any given name. Make sure you are importing the correct one. If you are unsure, please be sure to ask.

### Initialize the Test Data

**Scenario:** the API team is not sure exactly how they are going to provide image data. That is still being debated. But they are giving us the rest of the data, and the data has consistent IDs, so we can add our own images for the time being via our service.

We are going to need some test data. For our application, the data we get back from the server looks like the test data that we provided for the tea page, only it does not have an image associated with it. Let's initialize an array of teas called `expectedTeas` using that data.

First, create `expectedTeas` and `resultTeas` variables within the main `describe()` for the test (in the same area where the other variables are declared):

```typescript
...
  let expectedTeas: Array<Tea>;
  let resultTeas: Array<Omit<Tea, 'image'>>;
...
```

We can then use `expectedTeas` to manufacture a set of `resultTeas` by deleting the `image`. The `resultTeas` will be the result of our API call. Create the following function at the bottom of the main `describe()` function callback.

```typescript
const initializeTestData = () => {
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
    const { image, ...tea } = t;
    return tea;
  });
};
```

Call this function from the main `beforeEach()`.

### Get all of the teas

Create a `describe` for the "get all" functionality. All of our tests for the `getAll()` requirements will go there.

```typescript
describe('get all', () => {
  // Test cases will go here...
});
```

#### Test #1 - Getting Data from the Correct Endpoint

```typescript
it('gets the tea categories', () => {
  service.getAll().subscribe();
  const req = httpTestingController.expectOne(`${environment.dataService}/tea-categories`);
  expect(req.request.method).toEqual('GET');
  httpTestingController.verify();
});
```

Let's have a look at that test.

1. The first thing we do is call the `getAll()` and subscribe to the Observable that is returned. The `subscribe()` is very important. Without it, all we do is set up an Observable, but don't actually "activate" it.
1. Next, we tell the HTTP controller that we expect a call to our back end. This call finds that request that was made and returns it.
1. We expect that request to be a `GET` request.
1. Finally, we `verify()` that there were no unmatched requests made. That is, we verify that the only request that was made was the one we expected.

Write the minimal code required to make that test pass. Basically, this:

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http.get<Array<Omit<Tea, 'image'>>>(`${environment.dataService}/tea-categories`) as any;
  }
```

The casting to `any` is only needed here to make TypeScript happy. It will be removed later.

#### Test #2 - Convert the Data

As sometimes happens, the backend team has not quite figured out how they want to supply the pictures yet, so we will just hook them up based on the ID for now. We have already defined what the API result set looks like and what we expect out of the service.

```typescript
it('adds an image to each', () => {
  let teas: Array<Tea> = [];
  service.getAll().subscribe((t) => (teas = t));
  const req = httpTestingController.expectOne(`${environment.dataService}/tea-categories`);
  req.flush(resultTeas);
  httpTestingController.verify();
  expect(teas).toEqual(expectedTeas);
});
```

The flow of this test is very similar to the previous test with the following exceptions:

1. We already expected a `GET` so we don't need to expect that here.
1. Rather than just making the HTTP call, we are also flushing it. That is, we are telling the mock back end to return specific data for that request. This will trigger the code in the `subscribe()`.
1. We expect the data returned in the `subscribe()` to be our converted data.

The test currently fails because we are not converting the data. Let's work on that conversion code now.

In our service code, we can define an array of images.

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
    return this.http.get<Array<Omit<Tea, 'image'>>>(`${environment.dataService}/tea-categories`).pipe(
      map((teas) =>
        teas.map(t => ({
          ...t,
          image: `assets/img/${this.images[t.id - 1]}.jpg`,
        })),
      ),
    );
  }
```

### Refactor

The code that you have for this method looks like this:

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http.get<Array<Omit<Tea, 'image'>>>(`${environment.dataService}/tea-categories`).pipe(
      map((teas) =>
        teas.map(t => ({
          ...t,
          image: `assets/img/${this.images[t.id - 1]}.jpg`,
        })),
      ),
    );
  }
```

The problem here is that there is a lot for future you to parse when you come back to maintain this. The method is responsible for more than one thing: getting the data, and doing the conversion. Let's fix that by abstracting the code that does the conversion on a tea object into a local `convert()` method.

When you are done, the code should look more like this:

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http
      .get<Array<Omit<Tea, 'image'>>>(`${environment.dataService}/tea-categories`)
      .pipe(map((teas) => teas.map(t => this.convert(t))));
  }
```

Make sure your tests are still passing. That makes it clear that we are grabbing the teas from the API and returning them after a mapping process. The details of that conversion then are left to the `convert()` method, and everything is tidy and is only responsible for one thing.

Also note that you likely now have a couple of definitions of `Array<Omit<Tea, 'image'>>` in your code. It is best to refactor that into a locally declared type and use it instead. There is no need to export it. The fact that we also use that same type in the test is not a big deal.

**Best Practice:** The point of what we just did is that it is OK for things to get a little messy while you are working out exactly how it should work. However, before you call the code "done" you should clean it up to make it easier to maintain. Having properly written unit tests will help you ensure you are doing that clean-up correctly.

## Create a Mock Factory

The last step, as always for our services, is to create a mock factory for our new service. Have a look at `src/app/core/authentication/authentication.service.mock.ts` and use it as a model to create your own `src/app/core/tea/tea.service.mock.ts` file.

Remember to export the new factory from `src/app/core/testing.ts`.

## Conclusion

You have created a service to get the tea data from the server and convert it to the model we use within the application. We will use the data in the next lab.
