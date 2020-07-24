# Lab: Use the Data

In this lab you will:

- Inject a service into your main page
- Retrieve real data from the service, replacing the mock data

## Injector Error

Start by injecting the `TeaService` into the `tea` page.

```TypeScript
import { TeaService } from '@app/services';

...

  constructor(
    private auth: AuthenticationService,
    private teaService: TeaService
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

**`src/app/services/tea/tea.service.mock.ts`**

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

There are two lifecycle events that are good candidates for getting data:

- `ngOnInit` - Angular lifecycle event, fired when a component is instantiated
- `ionViewDidEnter` - Ionic lifecycle event, fired each time a page is visited

In our application, we want really only need to grab the data once, when the page is first loaded. The `ngOnInit` event is the best place for that.

Let's start by cleaning up the `TeaPage` a little:

- refactor `listToMatrix` to take a single array of teas and return a matrix of teas
- change the code that calls it to compensate for the change, your tests should still work
- change the class declaration for the page to add `implements OnInit`
- add an empty `ngOnInit()` method
- finally, remove the private `teaData` object and the `this.listToMatrix()` call in the constructor

That last item broke your tests. That is fine. We will fix that. If you did everything correctly, your code should now look something like this:

```typescript
import { Component, OnInit } from '@angular/core';
import { Tea } from '@app/models';
import { AuthenticationService, TeaService } from '@app/services';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-tea',
  templateUrl: 'tea.page.html',
  styleUrls: ['tea.page.scss'],
})
export class TeaPage implements OnInit {
  teaMatrix: Array<Array<Tea>> = [];

  constructor(
    private auth: AuthenticationService,
    private teaService: TeaService,
  ) {}

  ngOnInit() {}

  logout() {
    this.auth.logout().pipe(take(1)).subscribe();
  }

  private listToMatrix(teas: Array<Tea>): Array<Array<Tea>> {
    const matrix = [];
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

### Test First

First remove the "makes a tea matrix" test. We will certainly be making one, but we will be doing so based on the data fetched from the backend API, not from the hard coded data we had before.

For the new functionality, we want to test the following:

- it fetches the teas
- it makes an empty matrix if there are no teas
- it makes an X by 4 matrix when their are teas (use a multiple of 4 and a non-multiple of 4)

In order to do this, we will have to move where we do the `fixture.detectChanges();` call. This will have to be moved to the tests after the return value of the `getAll()` mock is set up.

The intial shell for the tests will then look like this:

```typescript
it('should create', () => {
  fixture.detectChanges();
  expect(component).toBeTruthy();
});

describe('initializetion', () => {
  it('gets the teas', () => {});

  it('creates an empty matrix if there is no tea', () => {});

  it('creates a 1x4 matrix for 4 teas', () => {});

  it('creates a 2x4 matrix with two empty spots in the last row for 6 teas', () => {});
});
```

Let's fill in the tests one at a time and create the code.

#### Get the Teas

```typescript
it('gets the teas', () => {
  const teaService = TestBed.inject(TeaService);
  fixture.detectChanges();
  expect(teaService.getAll).toHaveBeenCalledTimes(1);
});
```

Write the minimal code in `ngOnInit()` in order to make the test pass.

#### Initialize an Empty Matrix for No Tea

```typescript
it('creates an empty matrix if there is no tea', () => {
  const teaService = TestBed.inject(TeaService);
  (teaService.getAll as any).and.returnValue(of([]));
  fixture.detectChanges();
  expect(component.teaMatrix).toEqual([]);
});
```

This test likely already passes. If not, fix your code so it does.

#### Initialize a 1x4 Matrix for Four Teas

```typescript
it('creates a 1x4 matrix for 4 teas', () => {
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

#### Initialize a 1x4 Matrix for Four Teas

This test is really just a copy of the prior test with two more teas. The output should have two rows in the matix with the second row consisting of the two extra teas. Creation of this test is left as an exercise to the reader.

This test should pass. If it does not, figure out what is wrong and fix it.

#### Completed Code

When you are done, your `ngOnInit()` method should look something like this:

```typescript
  ngOnInit() {
    this.teaService
      .getAll()
      .pipe(map(t => this.listToMatrix(t)))
      .subscribe(m => (this.teaMatrix = m));
  }
```

## Conclusion

In the last two labs, we have learned how to abstract the logic to get data into a service and then how to use that service within our pages. Be sure to commit your changes.
