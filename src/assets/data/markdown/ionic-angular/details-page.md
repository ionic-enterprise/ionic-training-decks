b: Tea Details Page

In this lab, you will:

- add a child page to the application
- set up the navigation to and from the child page

## Stacked Navigation

Ionic supports the common mobile paradigm of stacked navigation, where one page is logically displayed over the top of another page. In this lab we will see that paradigm in action by creating a simple "details" page for each of our teas. This page will start simple, but we will add more inforamtion to it later.

## The Tea Details Page

### Generate

Use the `ionic generate page tea-details` command to generate the new page.

```bash
$ ionic generate page tea-details
> ng generate page tea-details --project=app
CREATE src/app/tea-details/tea-details-routing.module.ts (364 bytes)
CREATE src/app/tea-details/tea-details.module.ts (502 bytes)
CREATE src/app/tea-details/tea-details.page.scss (0 bytes)
CREATE src/app/tea-details/tea-details.page.html (130 bytes)
CREATE src/app/tea-details/tea-details.page.spec.ts (676 bytes)
CREATE src/app/tea-details/tea-details.page.ts (275 bytes)
UPDATE src/app/app-routing.module.ts (746 bytes)
[OK] Generated page!
```

Note the output of the command. This generated several files for us and also updated our main routing module. We now have a new route called `tea-details`. If we do a little URL hacking in our browser, we can even display the page. Neat!

But, we want details for a specific tea, so our route will need to have the tea ID as part of it. Let's start by modifying the route to take a parameter. Edit the `src/app/tea-details/tea-details-routing.module.ts` module file to add an `:id` parameter to the path. While we are here, also add the guard to the route.

```typescript
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeaDetailsPage } from './tea-details.page';
import { AuthGuardService } from '@app/core';

const routes: Routes = [
  {
    path: ':id',
    component: TeaDetailsPage,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeaDetailsPageRoutingModule {}
```

With a little URL hacking, you should still be able to get to this page, but now you will need to supply an ID like this: `tea-details/1`.

### Integrate the Page Into the App

The first thing we will do is to integrate the page within the routing flow of the application. This will involve:

- navigating to the page upon clicking a card on the Teas page
- reading the ID parameter from the route
- navigating back from the details page to the Teas page

#### Navigating to the Page

We will use the NavController to navigate to the child page. Provide a mock for that class in `src/app/tea/tea.page.spec.ts`:

```typescript
beforeEach(async(() => {
  TestBed.configureTestingModule({
    declarations: [TeaPage],
    imports: [IonicModule],
    providers: [
      provideMockStore<{ auth: AuthState; data: DataState }>({
        initialState: { auth: initialAuthState, data: initialDataState },
      }),
      {
        provide: NavController,
        useFactory: createNavControllerMock,
      },
    ],
  }).compileComponents();
  ...
}));
```

In the same file, create the following set of tests:

```typescript
describe('show details page', () => {
  let card: HTMLElement;
  beforeEach(() => {
    const grid = fixture.debugElement.query(By.css('ion-grid'));
    const rows = grid.queryAll(By.css('ion-row'));
    const cols = rows[0].queryAll(By.css('ion-col'));
    card = cols[2].query(By.css('ion-card')).nativeElement;
  });

  it('navigates forward', () => {
    const navController = TestBed.inject(NavController);
    click(card);
    expect(navController.navigateForward).toHaveBeenCalledTimes(1);
  });

  it('passes the details page and the ID', () => {
    const navController = TestBed.inject(NavController);
    click(card);
    expect(navController.navigateForward).toHaveBeenCalledWith([
      'tea-details',
      teas[2].id,
    ]);
  });
});
```

These tests assert that when a card is clicked we will navigate to the `tea-details/:id` route using the ID from the tea displayed by that card. Getting these tests to pass is a two step operation:

- update the template markup to include the proper event binding
- write the handler for the event

Here is the markup for the template. A `(click)` event binding has been added that will call a method called `showDetailsPage()` passing the tea's ID. The `button` property adds some styling to make the card behave in a "clickable" fashion.

```html
<ion-card button (click)="showDetailsPage(tea.id)">
  <!-- the contents of the card is here -->
</ion-card>
```

**Code Challenge:** write the `showDetailsPage()` method. To accomplish this, you will need to:

- inject the `NavController` in the `TeaPage` class
- call the appropriate method on that service passing the proper parameters (see the test)

#### Display Something

Before we get too far into the page, let's do an initial layout of what the data will look like.

##### `src/app/tea-details/tea-details.page.scss`

```css
ion-img {
  max-width: 75%;
  max-height: 512px;
}
```

##### `src/app/tea-details/tea-details.page.html`

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Tea Details</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <div *ngIf="tea$ | async as tea">
    <div class="ion-justify-content-center" style="display: flex">
      <ion-img [src]="tea?.image"></ion-img>
    </div>
    <h1 data-testid="name">{{ tea?.name }}</h1>
    <p data-testid="description">{{ tea?.description }}</p>
  </div>
</ion-content>
```

#### Selecting a Single Tea

NgRX selectors allow us to <a href="https://ngrx.io/guide/store/selectors#using-selectors-with-props" target="_blank">pass properties</a> to them. We can use this in order to craft a selector that will observe a specific tea within the state.

Open `src/app/store/selectors/data.selectors.ts` and add the following selector:

```TypeScript
export const selectTea = createSelector(
  selectTeas,
  (teas: Array<Tea>, props: { id: number }) =>
    teas.find(t => t.id === props.id),
);
```

Notice how we are building upon the other selectors.

#### Reading the ID Parameter

Now that we are navigating to the tea-details page with an ID parameter, we need to modify `src/app/tea-details/tea-details.page.ts` to read the parameter and get the tea informtion for that ID. To accomplish this we will need to use the Angular Components Router's `ActivedRoute` service and our store. We will also eventually make use of the `NavController`.

In the `src/app/tea-details/tea-details.page.spec.ts` file, set up the `TestBed` to inject mocks for these services.

```typescript
beforeEach(
  waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TeaDetailsPage],
      imports: [IonicModule],
      providers: [
        provideMockStore<{ data: DataState }>({
          initialState: { data: initialState },
        }),
        { provide: ActivatedRoute, useFactory: createActivatedRouteMock },
        { provide: NavController, useFactory: createNavControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeaDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }),
);
```

You will need to adjust your import statements accordingly.

Create an `initiallization` section in the test. Also, since we will need to do some setup within the initialization tests, remove the `fixture.detectChanges();` line from the main `beforeEach()`. That call will run the initialization, and we want to delay its execution until after our test setup code has run.

**Note:** We are not going to directly use the `NavController` but it will get used indirectly when we add the `ion-back-button` so we need the mock for it.

```typescript
describe('initialization', () => {});
```

We would like to write most of our tests from the point of view of the end user requirements, which would basically mean that we verify that we get the tea and display it properly without getting into implementation details, but we do have _one_ test that works out best if we just scratch the surface a bit on the implementation details, so we will start there:

```TypeScript
  describe('initialization', () => {
    let store: MockStore
    beforeEach(() => {
      const route = TestBed.inject(ActivatedRoute);
      (route.snapshot.paramMap.get as any).withArgs('id').and.returnValue('42');
      store = TestBed.inject(Store) as MockStore;
      store.overrideSelector(selectTea, {
        id: 7,
        name: 'White',
        description: 'Often looks like frosty silver pine needles',
        image: 'imgs/white.png',
      });
    });

    it('selects the tea based on the route', () => {
      spyOn(store, 'select').and.callThrough();
      fixture.detectChanges();
      expect(store.select).toHaveBeenCalledTimes(1);
      expect(store.select).toHaveBeenCalledWith(selectTea, { id: 42 });
    });
  });
```

**Note:** you need to remove the `fixture.detectChanges()` call from the `beforeEach()`. We want to delay the `ngOnInit()` call until after we have set up our spy.

The code for that looks like this:

```TypeScript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Tea } from '@app/models';
import { selectTea, State } from '@app/store';

@Component({
  selector: 'app-tea-details',
  templateUrl: './tea-details.page.html',
  styleUrls: ['./tea-details.page.scss'],
})
export class TeaDetailsPage implements OnInit {
  tea$: Observable<Tea>;

  constructor(private route: ActivatedRoute, private store: Store<State>) {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.tea$ = this.store.select(selectTea, { id });
  }
}
```

We can now do a couple more "user" centric tests by checking a couple of the bindings. Here is the test for the name binding:

```TypeScript
    it('binds the name', () => {
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('[data-testid="name"]'));
      expect(el.nativeElement.textContent.trim()).toBe('White');
    });
```

**Challenge:** add a similar test for the description. Both of these tests should go inside the "initialization" describe.

#### Navigating Back from the Details Page

We should now be able to get to the details page, but now the user is stuck there, at least on devices that don't have a back button. Let's fix that now.

1. go to the <a href="https://ionicframework.com/docs/api/back-button" target="_blank">`ion-back-button` documentation</a>
1. under the Angular Usage examples, the first one is marked "Default back button", try adding the appropriate mark-up from there in `src/app/tea-details/tea-details.page.html`

If you were already on the `tea-details` page when you did this, then you did not see a back-button. This is because when the page refreshed, the navigation stack was destroyed. If your app needs to still display the back button even if there is no navigation stack (for example, if you are going to deploy to the web where someone could go directly to the tea details page via a link), use the `defaultHref` property.

Feel free to play around with some of the other options if you would like to.

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
