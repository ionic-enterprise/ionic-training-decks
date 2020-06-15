# Lab: Tea Details Page

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

But, we want details for a specific tea, so our route will need to have the tea ID as part of it. Let's start by modifying the route to take a parameter. Edit the `src/app/tea-details/tea-details-routing.module.ts` module file to add an `:id` parameter to the path and to guard the route.

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

### Integrate the Page in to the App

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
      {
        provide: AuthenticationService,
        useFactory: createAuthenticationServiceMock,
      },
      {
        provide: NavController,
        useFactory: createNavControllerMock,
      },
      {
        provide: TeaService,
        useFactory: createTeaServiceMock,
      },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(TeaPage);
  component = fixture.componentInstance;
}));
```

In the same file, create the following set of tests:

```typescript
describe('show details page', () => {
  it('navigates forward', () => {
    const navController = TestBed.inject(NavController);
    component.showDetailsPage(42);
    expect(navController.navigateForward).toHaveBeenCalledTimes(1);
  });

  it('passes the details page and the ID', () => {
    const navController = TestBed.inject(NavController);
    component.showDetailsPage(42);
    expect(navController.navigateForward).toHaveBeenCalledWith([
      'tea-details',
      42,
    ]);
  });
});
```

These tests assert that when we call a method named `showDetailsPage()` with an ID, we will navigate to the `tea-details/:id` route. At this point, write the code that satisfies these tests.

Once the code is written, we need to hook up the click event in the HTML. When we click a card, we want to navigate to the details for that tea, so adding a `(click)` event binding on the `ion-card` makes the most sense. We will aslo add a `button` property which will add some styling to make the card behave in a "clickable" fashion.

```html
<ion-card button (click)="showDetailsPage(tea.id)"></ion-card>
```

Now when we click on a card we should go to the Tea Details page, and the path should include the ID.

#### Display Something

Before we get too far into the page, let's do an initial layout of what the data will look like.

##### `src/app/tea-details/tea-details.page.scss`

```css
ion-img {
  width: 75%;
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
  <div class="ion-justify-content-center" style="display: flex;">
    <ion-img [src]="tea?.image"></ion-img>
  </div>
  <h1>{{ tea?.name }}</h1>
  <p>{{ tea?.description }}</p>
</ion-content>
```

#### Reading the ID Parameter

Now that we are navigating to the tea-details page with an ID parameter, we need to modify `src/app/tea-details/tea-details.page.ts` to read the parameter and get the tea informtion for that ID. To accomplish this we will need to use the Angular Components Router's `ActivedRoute` service and our own `TeaService`. We will also eventually make use of the `NavController`.

In the `src/app/tea-details/tea-details.page.spec.ts` file, set up the `TestBed` to inject mocks for these services.

```typescript
beforeEach(async(() => {
  TestBed.configureTestingModule({
    declarations: [TeaDetailsPage],
    imports: [IonicModule],
    providers: [
      {
        provide: ActivatedRoute,
        useFactory: createActivatedRouteMock,
      },
      {
        provide: NavController,
        useFactory: createNavControllerMock,
      },
      { provide: TeaService, useFactory: createTeaServiceMock },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(TeaDetailsPage);
  component = fixture.componentInstance;
  fixture.detectChanges();
}));
```

You will need to adjust your import statements accordingly.

Create an `initiallization` section in the test. Also, since we will need to do some setup within the initialization tests, remove the `fixture.detectChanges();` line from the main `beforeEach()`. That call will run the initialization, and we want to delay its execution until after our test setup code has run.

**Note:** We are not going to directly use the `NavController` but it will get used indirectly when we add the `ion-back-button` so we need the mock for it.

```typescript
describe('initialization', () => {});
```

We are now ready to start writing tests. Add the following tests one at a time and then write the code that satisfies them.

First, we need to get the ID from the route:

```typescript
it('determines the ID from the route', () => {
  const route = TestBed.inject(ActivatedRoute);
  fixture.detectChanges();
  expect(route.snapshot.paramMap.get).toHaveBeenCalledTimes(1);
  expect(route.snapshot.paramMap.get).toHaveBeenCalledWith('id');
});
```

Now add code in `src/app/tea-details/tea-details.page.ts` in the `ngOnInit()` method that satisfies the test.

Next we need to pass the ID to the `TeaService`. Note that the ID is read from the route as a string but we want to pass an integer to our service. A conversion wil be required.

```typescript
it('gets the tea of the ID', () => {
  const route = TestBed.inject(ActivatedRoute);
  const teaService = TestBed.inject(TeaService);
  (route.snapshot.paramMap.get as any).and.returnValue('42');
  fixture.detectChanges();
  expect(teaService.get).toHaveBeenCalledTimes(1);
  expect(teaService.get).toHaveBeenCalledWith(42);
});
```

Now add code in `src/app/tea-details/tea-details.page.ts` in the `ngOnInit()` method that satisfies the test.

Finally, we will make sure the tea is bound properly in the HTML.

```typescript
it('gets the tea of the ID', () => {
  const route = TestBed.inject(ActivatedRoute);
  const teaService = TestBed.inject(TeaService);
  (teaService.get as any).and.returnValue(
    of({
      id: 42,
      name: 'Yellow',
      image: 'assets/img/yellow.jpg',
      description: 'Yellow tea description.',
    }),
  );
  (route.snapshot.paramMap.get as any).and.returnValue('42');
  fixture.detectChanges();
  const h1 = fixture.debugElement.query(By.css('h1'));
  expect(h1.nativeElement.textContent).toEqual('Yellow');
  const p = fixture.debugElement.query(By.css('p'));
  expect(p.nativeElement.textContent).toEqual('Yellow tea description.');
});
```

Now add code in `src/app/tea-details/tea-details.page.ts` in the `ngOnInit()` method that satisfies the test. In this case, you will also have to create a new property on the class as such: `tea: Tea;` where `Tea` is defined in our `@app/models` module.

When you are complete, your `src/app/tea-details/tea-details.page.ts` file should look something like this:

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TeaService } from '@app/core';
import { Tea } from '@app/models';

@Component({
  selector: 'app-tea-details',
  templateUrl: './tea-details.page.html',
  styleUrls: ['./tea-details.page.scss'],
})
export class TeaDetailsPage implements OnInit {
  tea: Tea;

  constructor(private route: ActivatedRoute, private teaService: TeaService) {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.teaService.get(id).subscribe((t: Tea) => (this.tea = t));
  }
}
```

#### Navigating Back from the Details Page

We should now be able to get to the details page, but now the user is stuck there, at least on devices that don't have a back button. Let's fix that now.

1. go to the <a href="https://ionicframework.com/docs/api/back-button" target="_blank">`ion-back-button` documentation</a>
1. under the Angular Usage examples, the first one is marked "Default back button", try adding the appropriate mark-up from there in `src/app/tea-details/tea-details.page.html`

If you were already on the `tea-details` page when you did this, then you did not see a back-button. This is because when the page refreshed, the navigation stack was destroyed. If your app needs to still display the back button even if there is no navigation stack (for example, if you are going to deploy to the web where someone could go directly to the tea details page via a link), use the `defaultHref` property.

Feel free to play around with some of the other options if you would like to.

## Conclusion

In this lab, you added a child page and examined how stacked navigation works. In the next section we will look at adding a shared component to our project that we can then use on this page to rate the teas.
