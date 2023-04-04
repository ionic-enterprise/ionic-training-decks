# Tea Details Page

In this lab, you will:

- Add a child page to the application
- Set up the navigation to and from the child page

## Stacked Navigation

Ionic supports the common mobile paradigm of stacked navigation, where one page is logically displayed over the top of another page. In this lab we will see that paradigm in action by creating a simple "details" page for each of our teas. This page will start simple, but we will add more information to it later.

## The Tea Details Page

### Generate

Use the `ionic generate page tea-details` command to generate the new page.

```bash
$ ionic generate page tea-details
> ng generate page tea-details --project=app
CREATE src/app/tea-details/tea-details.page.scss (0 bytes)
CREATE src/app/tea-details/tea-details.page.html (130 bytes)
CREATE src/app/tea-details/tea-details.page.spec.ts (676 bytes)
CREATE src/app/tea-details/tea-details.page.ts (275 bytes)
UPDATE src/app/app.routes.ts (746 bytes)
[OK] Generated page!
```

Note the output of the command. This generated several files for us and also updated our main routing module. We now have a new route called `tea-details`. If we do a little URL hacking in our browser, we can even display the page. Neat!

But, we want details for a specific tea, so our route will need to have the tea ID as part of it. Let's start by modifying the route to take a parameter. Edit the `src/app/app.routes.ts` file to add an `:id` parameter to the path. While we are here, also add the guard to the route.

```typescript
  {
    path: 'tea-details/:id',
    loadComponent: () => import('./tea-details/tea-details.page').then((c) => c.TeaDetailsPage),
    canActivate: [authGuard]
  },
```

With a little URL hacking, you should still be able to get to this page, but now you will need to supply an ID like this: `tea-details/1`.

### Integrate the Page Into the App

The first thing we will do is to integrate the page within the routing flow of the application. This will involve:

- navigating to the page upon clicking a card on the Teas page
- reading the ID parameter from the route
- navigating back from the details page to the Teas page

#### Navigating to the Page

We will use the NavController to navigate from the `TeaPage` to the child page when a tea card is clicked. In the `src/app/tea/tea.page.spec.ts` file, create the following set of tests:

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
    expect(navController.navigateForward).toHaveBeenCalledWith(['tea-details', teas[2].id]);
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

**Code Challenge:** write the `showDetailsPage()` method.

#### Display Something

Before we get too far into the page, let's do an initial layout of what the data will look like.

##### `src/app/tea-details/tea-details.page.scss`

```css
ion-img {
  max-width: 75%;
  max-height: 512px;
}
```

##### `src/app/tea-details/tea-details.page.ts`

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tea } from '@app/models';
import { IonicModule } from '@ionic/angular';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-tea-details',
  templateUrl: './tea-details.page.html',
  styleUrls: ['./tea-details.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TeaDetailsPage implements OnInit {
  tea$: Observable<Tea> = EMPTY;

  constructor() {}

  ngOnInit() {}
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

This will not display anything right now. First we need to get the data. We will work on that next.

#### Getting a Single Tea

We need to modify the `TeaService` to include a `get()` method that returns a single tea. Add the following signature to `src/app/core/tea/tea.service.ts`:

```typescript
  get(id: number): Observable<Tea> {
    // This is the part you will fill in once the tests are in place
  }
```

The tests look a lot like the tests for `getAll()` with the following exceptions:

- An `id` is passed to `get()`.
- The `id` is included in the URL.
- A single tea is returned and not an array of teas.

Add the following tests to `src/app/core/tea/tea.service.spec.ts`:

```typescript
describe('get', () => {
  it('gets the tea category', () => {
    service.get(3).subscribe();
    const req = httpTestingController.expectOne(`${environment.dataService}/tea-categories/3`);
    expect(req.request.method).toEqual('GET');
    httpTestingController.verify();
  });

  it('adds an image', () => {
    let tea: Tea = expectedTeas[0];
    service.get(3).subscribe((t) => (tea = t));
    const req = httpTestingController.expectOne(`${environment.dataService}/tea-categories/3`);
    req.flush(resultTeas[2]);
    httpTestingController.verify();
    expect(tea).toEqual(expectedTeas[2]);
  });
});
```

**Code Challenge #1:** With the tests in place, you are ready to write the code for the `get()` method. Use the `getAll()` as a model, making the necessary changes to handle just a single tea rather than an array.

**Code Challenge #2:** Add the `get()` method to `src/app/core/tea/tea.service.mock.ts`

#### Getting the Tea in the Page

Now that we are navigating to the `tea-details` page with an ID parameter, we need to modify `src/app/tea-details/tea-details.page.ts` to read the parameter and get the tea information for that ID. To accomplish this we will need to use the Angular Components Router's `ActivedRoute` service and the `get()` method we just added to our `TeaService`.

In the `src/app/tea-details/tea-details.page.spec.ts` file, set up the `TestBed` to inject mocks for these services.

```typescript
beforeEach(waitForAsync(() => {
  TestBed.configureTestingModule({
    imports: [TeaDetailsPage],
  })
    .overrideProvider(ActivatedRoute, { useFactory: createActivatedRouteMock })
    .overrideProvider(TeaService, { useFactory: createTeaServiceMock })
    .compileComponents();

  fixture = TestBed.createComponent(TeaDetailsPage);
  component = fixture.componentInstance;
  fixture.detectChanges();
}));
```

You will need to adjust your import statements accordingly.

Create an `initialization` section in the test. Also, since we will need to do some setup within the initialization tests, remove the `fixture.detectChanges();` line from the main `beforeEach()`. That call will run the initialization, and we want to delay its execution until after our test setup code has run.

In the `beforeEach()`, we need to set up the current route so it has an ID on it. We also need to set up the value returned by the `TeaService` when `get()` is called.

```typescript
describe('initialization', () => {
  beforeEach(() => {
    const route = TestBed.inject(ActivatedRoute);
    (route.snapshot.paramMap.get as any).withArgs('id').and.returnValue('7');
    const tea = TestBed.inject(TeaService);
    (tea.get as jasmine.Spy).and.returnValue(
      of({
        id: 7,
        name: 'White',
        description: 'Often looks like frosty silver pine needles',
        image: 'imgs/white.png',
      })
    );
  });

  it('binds the name', () => {
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('[data-testid="name"]'));
    expect(el.nativeElement.textContent.trim()).toBe('White');
  });
});
```

**Note:** remember to remove the `fixture.detectChanges()` call from the top-level `beforeEach()`.

The code that satisfies that test looks like this:

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TeaService } from '@app/core';
import { Tea } from '@app/models';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-tea-details',
  templateUrl: './tea-details.page.html',
  styleUrls: ['./tea-details.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TeaDetailsPage implements OnInit {
  tea$: Observable<Tea> = EMPTY;

  constructor(private route: ActivatedRoute, private tea: TeaService) {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') as string, 10);
    this.tea$ = this.tea.get(id);
  }
}
```

**Challenge:** add a similar test for the description.

#### Navigating Back from the Details Page

We should now be able to get to the details page, but now the user is stuck there, at least on devices that don't have a back button. Let's fix that now.

1. go to the <a href="https://ionicframework.com/docs/api/back-button" target="_blank">`ion-back-button` documentation</a>
1. under the Angular Usage examples, the first one is marked "Basic Usage", try adding the appropriate mark-up from there in `src/app/tea-details/tea-details.page.html`

**Note:** in the example, you will need to scroll over to the `src/app/page-two.component.ts` tab in order to find the markup you are looking for.

If you were already on the `tea-details` page when you did this, then you did not see a back-button. This is because when the page refreshed, the navigation stack was destroyed. If your app needs to still display the back button even if there is no navigation stack (for example, if you are going to deploy to the web where someone could go directly to the tea details page via a link), use the `defaultHref` property.

Feel free to play around with some of the other options if you would like to.

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
