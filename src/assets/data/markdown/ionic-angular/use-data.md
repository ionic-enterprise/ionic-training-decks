# Lab: Use the Data

In this lab you will:

- Inject a service into your main page
- Retrieve real data from the service, replacing the mock data

## Injector Error

Start by injecting the `TeaService` into the `tea` page.

```TypeScript
import { TeaService } from '@app/core';

...

  constructor(
    private auth: AuthenticationService,
    private tea: TeaService
  ) {}
```

## Mock the Service

One problem we see right away is that the test for the `TeaPage` has started failing because the `TestBed` does not know how to inject the `HttpClient`. The real issue, though is that are are tring to inject the real `TeaService`.

1. We are testing the page in isolation, so we should create a mock object for the tea service.
1. We need to provide the mock tea service to the test.

I prefer to keep my mocks along side my services. This has a couple of benefits:

1. It allows for having a standard mock for each service.
1. It makes it easy to remember to update the mock each time the service is updated.

### Create the Mock Service Factory

The factory creates a jasmine spy matching the API for the service. In the case of the tea service, each method returns an `EMPTY` observable by default.

#### `src/app/core/tea/tea.service.mock.ts`

```TypeScript
import { EMPTY } from 'rxjs';
import { TeaService } from './tea.service';

export function createTeaServiceMock() {
  return jasmine.createSpyObj<TeaService>('TeaService', {
    getAll: EMPTY,
    get: EMPTY,
  });
}
```

Remember to add the mock to the `src/app/core/testing.ts`

### Inject the Mock Service

The mock can either be manually created and injecting via `useValue` or we can provide the factory for the service and let Angular's DI create the service for us. I prefer the latter.

```TypeScript
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeaPage],
      imports: [IonicModule],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
        {
          provide: TeaService,
          useFactory: createTeaServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));
```

## Using the Data

There are a few lifecycle events that are good candidates for getting and/or refreshing data:

- `ngOnInit` - Angular lifecycle event, fired when a component is instantiated
- `ionViewWillEnter` / `ionViewDidEnter` - Ionic lifecycle events, fired each time a page is visited

The `ngOnInit` method is an excellent place to set up our observable pipeline.

If we had the desire to refresh our data we could do so via RxJS Subjects and emitting an event from either `ionViewWillEnter` or `ionViewDidEnter`. We will see an example where we do something like this later in the course.

### Page Class Cleanup

Let's start by cleaning up the `TeaPage` a little:

- refactor `listToMatrix` to take a single array of teas and return a matrix of teas
- change the code that calls it to compensate for the change (`this.teaMatrix = this.listToMatrix(this.teaData);`), your tests should still work
- change the class declaration for the page to add `implements OnInit`
- add an empty `ngOnInit()` method
- rename `teaMatrix` to `teaMatrix$` and make it an `Observable<Array<Array<Tea>>>`
- finally, remove the private `teaData` object and the `this.listToMatrix()` call in the constructor

That last items broke your tests. That is fine. We will fix that. If you did everything correctly, your code should now look something like this:

```typescript
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Tea } from '@app/models';
import { AuthenticationService, TeaService } from '@app/core';

@Component({
  selector: 'app-tea',
  templateUrl: 'tea.page.html',
  styleUrls: ['tea.page.scss'],
})
export class TeaPage implements OnInit {
  teaMatrix$: Observable<Array<Array<Tea>>>;

  constructor(private auth: AuthenticationService, private tea: TeaService) {}

  ngOnInit() {}

  logout() {
    this.auth.logout().pipe(take(1)).subscribe();
  }

  private listToMatrix(teas: Array<Tea>): Array<Array<Tea>> {
    const matrix: Array<Array<Tea>> = [];
    let row = [];
    teas.forEach(t => {
      row.push(t);
      if (row.length === 4) {
        matrix.push(row);
        row = [];
      }
    });

    if (row.length) {
      matrix.push(row);
    }

    return matrix;
  }
}
```

### Consume the Observable

We need to make one small modification to the HTML for our page. The template will now directly consume the Observable that we are exporting from the page's class. This means a variable name change in the binding, as well as adding the async pipe.

```html
<ion-row
  *ngFor="let teaRow of teaMatrix$ | async"
  class="ion-justify-content-center ion-align-items-stretch"
></ion-row>
```

### Test First

First remove the "makes a tea matrix" test. We will certainly be making one, but we will be doing so based on the data fetched from the backend API, not from the hard coded data we had before.

For the new functionality, we want to test the following:

- it fetches the teas
- it displays an empty matrix if there are no teas
- it displays an X by 4 matrix when their are teas (use a multiple of 4 and a non-multiple of 4)

In order to do this, we will have to move where we do the `fixture.detectChanges();` call. This will have to be moved to the tests after the return value of the `getAll()` mock is set up. We should also remove any existing initialization tests. They will be replaced.

The intial shell for the tests will then look like this:

```typescript
it('should create', () => {
  fixture.detectChanges();
  expect(component).toBeTruthy();
});

describe('initialization', () => {
  it('gets the teas', () => {});

  it('displays an empty matrix if there is no tea', () => {});

  it('displays a 1x4 matrix for 4 teas', () => {});

  it('displays a 2x4 matrix with two empty spots in the last row for 6 teas', () => {});
});
```

**Important:** make sure the `fixture.detectChanges()` is removed from the `beforeEach()`.

Let's fill in the tests one at a time and create the code.

#### Get the Teas

```typescript
it('gets the teas', () => {
  const teaService = TestBed.inject(TeaService);
  fixture.detectChanges();
  expect(teaService.getAll).toHaveBeenCalledTimes(1);
});
```

Write the minimal code in `ngOnInit()` in order to make the test pass. This will be the start of us building out our observable pipeline.

```typescript
  ngOnInit() {
    this.teaMatrix$ = this.tea.getAll() as any;
  }
```

Once again, the `as any` is just to make TypeScript happy for now. It will be removed after we properly transform the data.

#### Initialize an Empty Matrix for No Tea

```typescript
it('displays an empty matrix if there is no tea', () => {
  const teaService = TestBed.inject(TeaService);
  (teaService.getAll as any).and.returnValue(of([]));
  fixture.detectChanges();
  const rows = fixture.debugElement.queryAll(By.css('ion-row'));
  expect(rows.length).toEqual(0);
});
```

**Note:** The above test requires a couple of imports to be added:

- `import { of } from 'rxjs';`
- `import { By } from '@angular/platform-browser';`

This test likely already passes. If not, fix your code so it does.

#### Display a 1x4 Matrix for Four Teas

```typescript
it('displays a 1x4 matrix for 4 teas', () => {
  const teaService = TestBed.inject(TeaService);
  (teaService.getAll as any).and.returnValue(
    of([
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
    ]),
  );
  fixture.detectChanges();
  expect(component.teaMatrix).toEqual([
    [
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
    ],
  ]);
});
```

write the code required to get this to pass. You will need to add a `map` to the observable pipeline that is returned by the `getAll()`, use a call to `this.listToMatrix()` to transform the data, `subscribe()` to the observable, and assign the `this.teaMatrix` appropriately.

#### Display a 2x4 Matrix for Four Teas

This test is really just a copy of the prior test with two more teas. The output should have two rows in the matix with the second row consisting of the two extra teas. Creation of this test is left as an exercise to the reader.

This test should pass. If it does not, figure out what is wrong and fix it.

#### Completed Code

When you are done, your `ngOnInit()` method should look something like this:

```typescript
  ngOnInit() {
    this.teaMatrix$ = this.tea
      .getAll()
      .pipe(map((teas: Array<Tea>) => this.listToMatrix(teas)));
  }
```

## Conclusion

In the last two labs, we have learned how to to get data via a service and then how to use that service within our pages. Be sure to commit your changes.
