# Lab: Use the Data

In this lab you will use the service you just created.

## Update the Test

We are going to start getting the data from the service we just created within our `TeaPage`. For the most part, I will describe the changes you should make to the test, but I leave it to you to figure out how to make the changes. Here is a synopsis of those changes:

- Inject a mock of the service.
- Change the tea data from what is hard coded in the page. Adjust the tests accordingly.
- Set up the service to return the modified tea data.

For all of the code mentioned here, we are working in one of the files in `src/app/tea`.

### Inject a Mock of the Service

We currently are injecting the following mocks:

**`src/app/tea/tea.page.spec.ts`**

```typescript
TestBed.overrideProvider(AuthenticationService, { useFactory: createAuthenticationServiceMock })
  .overrideProvider(NavController, { useFactory: createNavControllerMock })
  .overrideProvider(SessionVaultService, { useFactory: createSessionVaultServiceMock });
```

Using this as a template, add code to provide a mock for the `TeaService`.

**Note:** you will need to add some import statements for missing items.

### Change the Test Data

The easiest way to modify the test data from what we have hard coded in the page is to simply remove one of the teas. It doesn't matter which one, just remove one. Once you do, you will also need to:

- Change the "a grid of seven teas" `describe()` to "a grid of six teas".
- Change the count of teas in the second row.
- Change the count of teas in the tests that count all columns.

We should have failing tests at this point, since the page is still using the seven teas that are hard-coded within the page logic.

### Set up the Service

In order to properly display the teas on our page, the service needs to get set up to return the data.

Add the following code in the main `beforeEach()` for all of our tests. This code should be after we set up the `TestBed` but before the creation of the fixture.

```typescript
const tea = TestBed.inject(TeaService);
(tea.getAll as jasmine.Spy).and.returnValue(of(teas));
```

## Update the Code

We will switch the code over from having hard coded data to having an `Observable` that we will subscribe to in order to get the data from our back end API. To do this:

1. Remove the `teaData` array and the `teaMatrix` getter.
1. Define a new public property for our `Observable`: `teaMatrix$: Observable<Array<Array<Tea>>> = of([]);`.
1. Inject the `TeaService` in the constructor (`private tea: TeaService`).
1. if it is not already there, modify the class definition such that we specify the class implements `OnInit` (`export class TeaPage implements OnInit`), then add an `ngOnInit()` method.

The `ngOnInit()` method should set up the observable that we created.

**`src/app/tea/tea.page.ts`**

```typescript
  ngOnInit() {
    this.teaMatrix$ = this.tea.getAll().pipe(map((teas) => this.toMatrix(teas)));
  }
```

Notice that we are not subscribing to the observable. This will be handled in the template.

## Update the Template

The template change is pretty small. Rather than having a `teaMatrix` getter, we will now have a `teaMatrix$` RxJS `Observable` so we need to use it and pipe it through the `async` pipe. The `async` pipe will handle subscribing and unsubscribing for us.

**`src/app/tea/tea.page.html` (diff)**

```diff
-    <ion-row *ngFor="let teaRow of teaMatrix" class="ion-align-items-stretch">
+    <ion-row *ngFor="let teaRow of teaMatrix$ | async" class="ion-align-items-stretch">
```

The use of `async` also allows our page to "play nice" with the `OnPush` <a href="https://angular.io/api/core/ChangeDetectorRef#usage-notes" target="_blank">change detection strategy</a>. This would not really have any effect on this application, but in a larger data-centric app it may. Setting that up in this page is left as an exercise to the reader if you would like to try it.

## Conclusion

In the last two labs, we have learned how to to get data via a service and then how to use that service within our pages. Be sure to commit your changes.
