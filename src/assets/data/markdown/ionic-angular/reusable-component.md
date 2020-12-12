# Lab: Create a Rating Component

In this lab you will:

- Create a `shared` module
- Add a reusable component to the `shared` library
- Use the component in the details page

## Create the `SharedModule`

A common convension in Angular application is to use a <a href="https://angular.io/guide/ngmodule-faq#sharedmodule" target="_blank">`SharedModule`</a> containing components, directives, and pipes that are used throughout the application.

Create a shared module, and then create the rating component in the same folder

```bash
$ ionic g module shared
$ ionic g component shared/rating
```

The `RatingComponent` will need to be declared and exported in the `SharedModule` so we will then be able to use it elsewhere in the system. We are going to use at least one Ionic Framework component in this module, so be sure to import the `FormsModule` and `IonicModule` as well.

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RatingComponent } from './rating/rating.component';

@NgModule({
  declarations: [RatingComponent],
  exports: [RatingComponent],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SharedModule {}
```

Create a barrel file (`src/app/shared/index.ts`) to export the module and all components that we add to the shared module.

## Use the `RatingComponent`

Our component isn't very useful or interesting yet, but it will be hard to build it out if we cannot see it somewhere. Let's just show it on the `TeaDetailsPage`. We can refine how it is used later.

The first thing we will need to do is import our `SharedModule` in the `TeaDetailsPageModule`.

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeaDetailsPageRoutingModule } from './tea-details-routing.module';

import { TeaDetailsPage } from './tea-details.page';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TeaDetailsPageRoutingModule,
  ],
  declarations: [TeaDetailsPage],
})
export class TeaDetailsPageModule {}
```

We will also need to do the same when setting up the testing module within `src/app/tea-details/tea-details.page.spec.ts`.

Then we can add the markup to our page. Add the following to `tea-details.page.html` after the description paragraph:

```html
<app-rating></app-rating>
```

That just displays `rating works!` which isn't very interesting. Let's fix that next.

## Build the `RatingComponent`

Our rating component will just be a simple five-star rating system. The following changes should all be applied to the appropriate files under the `src/app/shared/rating` folder.

### Build the Template

First let's just get a row of five stars out there:

```html
<div>
  <ion-icon *ngFor="let n of [1, 2, 3, 4, 5]" name="star"></ion-icon>
</div>
```

Next, add a `rating` property to the class and give it a value greather than zero but less then 5. Change the markup to that number of filled in stars with the rest being outline stars.

```html
<div>
  <ion-icon
    *ngFor="let n of [1, 2, 3, 4, 5]"
    [name]="n > rating ? 'star-outline' : 'star'"
  ></ion-icon>
</div>
```

Finally, let's add a `click` handler that will change the rating as the user clicks on a star:

```html
<div>
  <ion-icon
    *ngFor="let n of [1, 2, 3, 4, 5]"
    [name]="n <= rating ? 'star' : 'star-outline'"
    (click)="rating = n"
  ></ion-icon>
</div>
```

So far so good.

### Style the Component

So far this works well, but the stars are a little small and close together, especially for people with larger hands. Let's apply a little style to make that better. Add the following to `src/app/shared/rating/rating.component.scss`:

```scss
ion-icon {
  font-size: 24px;
  padding-right: 12px;
  color: gold;
}

ion-icon:last-child {
  padding-right: px;
}
```

### Integrate with NgModel

If we make our component implement the `ControlValueAccessor` interface, it will automatically work in forms nicely and support two-way bindings with `[(ngModel)]`.

First let's scafold out the code a little to get the boiler-plate stuff:

```typescript
import { Component, forwardRef, Input, HostBinding } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
  ],
})
export class RatingComponent implements ControlValueAccessor {
  rating: number;

  constructor() {}

  /* tslint:disable:variable-name */
  onChange = (_rating: number) => {};
  /* tslint:endable:variable-name */

  onTouched = () => {};

  writeValue(rating: number): void {
    this.rating = rating;
    this.onChange(rating);
  }

  registerOnChange(fn: (rating: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
```

Some of the ES6 imports are not used at this point, but we will add stuff later for that.

Let's also scafold the test. This one will be a little more complex because we want to test out how the component behaves when it is used, so we will need to create a host component for our tests.

```typescript
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RatingComponent } from './rating.component';

@Component({
  template: ` <app-rating
    [(ngModel)]="rating"
    [disabled]="disabled"
    (ngModelChange)="onChange()"
  >
  </app-rating>`,
})
class TestHostComponent {
  disabled = false;
  rating = 1;
  changed = 0;
  onChange() {
    this.changed++;
  }
}

describe('RatingComponent', () => {
  let hostComponent: TestHostComponent;
  let ratingEl: HTMLElement;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RatingComponent, TestHostComponent],
      imports: [FormsModule, IonicModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    ratingEl = fixture.nativeElement.querySelector('app-rating');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
    expect(ratingEl).toBeTruthy();
  });
});
```

#### Update the NgModel

When a star is clicked, we want to make sure that the value bound to the `[(ngModel)]` gets updated and that the change handler gets called. Here is a test for that. The naming of the `describe()` will make more sense later. Add this in `ratings.component.spec.ts`:

```typescript
describe('when enabled', () => {
  it('sets the rating on click', () => {
    const stars = ratingEl.querySelectorAll('ion-icon');
    stars[3].click();
    expect(hostComponent.rating).toEqual(4);
  });

  it('calls the change handler on click', () => {
    const stars = ratingEl.querySelectorAll('ion-icon');
    hostComponent.changed = 0;
    stars[3].click();
    expect(hostComponent.changed).toEqual(1);
  });
});
```

This will be easier to implement as we go if we bind the `(click)` event in our component to a method in the component's class. So let's do that now.

Open the `src/app/shared/rating/rating.component.html` file and change the `(click)` binding as such:

```html
<div>
  <ion-icon
    *ngFor="let n of [1, 2, 3, 4, 5]"
    [name]="n <= rating ? 'star' : 'star-outline'"
    (click)="ratingClicked(n)"
  ></ion-icon>
</div>
```

Then let's create the code. For now, `ratingClicked()` just needs to call through to the boiler-plate `writeValue()` method. Add the following code in `ratings.component.ts`:

```typescript
  ratingClicked(rating: number): void {
    this.writeValue(rating);
  }
```

#### Allow the Component to be Disabled

It would be good if we could allow this component to be disabled. When we do this, we should reduce the opacity to make it look "grayed out", and we should diabled clicks. Add a test to the "when enabled" section of the test.

```typescript
it('sets the opacity to 1', () => {
  expect(ratingEl.style.opacity).toEqual('1');
});
```

Also add a section that shows the behavior when the component is disabled:

```typescript
describe('when disabled', () => {
  beforeEach(() => {
    hostComponent.disabled = true;
    fixture.detectChanges();
  });

  it('sets the opacity to 0.25', () => {
    expect(ratingEl.style.opacity).toEqual('0.25');
  });

  it('does not set the rating on click', () => {
    const stars = ratingEl.querySelectorAll('ion-icon');
    stars[3].click();
    expect(hostComponent.rating).toEqual(1);
  });

  it('does not call the change handler on click', () => {
    const stars = ratingEl.querySelectorAll('ion-icon');
    hostComponent.changed = 0;
    stars[3].click();
    expect(hostComponent.changed).toEqual(0);
  });
});
```

In order to get these tests to pass, add the following code to the `rating.component.ts` file:

First, before the constructor, add this:

```typescript
  @Input() disabled = false;
  @HostBinding('style.opacity')
  get opacity(): number {
    return this.disabled ? 0.25 : 1;
  }
```

Next, modify `ratingClicked()` to only do anything if the component is not disabled:

```typescript
  ratingClicked(rating: number): void {
    if (!this.disabled) {
      this.writeValue(rating);
    }
  }
```

The tests should now be passing, but we will add one more little piece of boiler-plate code that will make the component behave properly when Angular needs to set the component disabled via functional means:

```typescript
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
```

Our component is now ready for use.

## Save the Rating

We need to modify the `TeaService` to both save and retrieve the rating for each tea. Our backend API does not currently support the rating on a tea, so we will store this data localy using the Capacitor Storage API. Our tasks for this will include:

- Add an optional `rating` property to the `Tea` model
- Modify the service to get the rating
- Add a `save()` method to the service that will save the rating

### Update the Model

Update `src/app/models/tea.ts` and add the following property:

```typescript
  rating?: number;
```

### Get the Rating

#### Modify the Test Data

In the `expectedTeas` array that is part of the `TeaService` test, add a rating to each tea as such:

```typescript
      {
        id: 1,
        name: 'Green',
        image: 'assets/img/green.jpg',
        description: 'Green tea description.',
        rating: 4
      },
```

For some of them, use zero. This will be the default value for teas that do not yet have a rating.

The rating is not part of the data coming back from our API, so the API results we use cannot have it. Where the `resultTeas` array is defined, delete the `rating` just like we do for the `image`.

```typescript
resultTeas = expectedTeas.map((t: Tea) => {
  const tea = { ...t };
  delete tea.image;
  delete tea.rating;
  return tea;
});
```

#### Set up the Storage Mock

We will use the Capacitor Storage API, so we will mock that. There are multiple ways that we could store the ratings. We will just go with the very simple strategy of using a key of `ratingX` where `X` is the `ID` of the tea.

First, define a variable to store the real `Storage` implementation so we can restore it when we are done:

```typescript
let originalStorage: any;
```

Then update the setup and teardown for the tests to initialize the behavior of the `Storage` mock. Where the return values are set up, they will need to match however you set up your test data above. Only the non-zero rated teas should be included. Note that `Plugins.Storage.get()` resolves a string value and not a number.

```typescript
beforeEach(() => {
  originalStorage = Plugins.Storage;
  Plugins.Storage = jasmine.createSpyObj('Storage', {
    get: Promise.resolve(),
    set: Promise.resolve(),
  });
  initializeTestData();
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  });
  httpTestingController = TestBed.inject(HttpTestingController);
  service = TestBed.inject(TeaService);
  (Plugins.Storage.get as any)
    .withArgs({ key: 'rating1' })
    .and.returnValue(Promise.resolve({ value: '4' }));
  // repeat for all expectedTeas with a non-zero rating
  // the key is `rating${id}}`
});

afterEach(() => {
  Plugins.Storage = originalStorage;
});
```

We are also going to have to combine code that returns an `Observable` with code that resolves a `Promise`. In order to deal with this cleanly, wrap the tests that perform a `flush()` in the `fakeAsync` zone and call `tick()` after the `flush()` as such:

```typecript
    it('adds an image to each', fakeAsync(() => {
      let teas: Array<Tea>;
      service.getAll().subscribe(t => (teas = t));
      const req = httpTestingController.expectOne(
        `${environment.dataService}/tea-categories`,
      );
      req.flush(resultTeas);
      tick();
      httpTestingController.verify();
      expect(teas).toEqual(expectedTeas);
    }));
```

You will need to import `fakeAsync` and `tick`:

```typescript
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
```

#### Write the Code

At this point, you should have two failing tests. Update the code in `src/app/core/tea/tea.service.ts` to make them pass.

The first step is to make our private `convert()` method async and then grab the rating from storage:

```typescript
  private async convert(tea: any): Promise<Tea> {
    const { Storage } = Plugins;
    const rating = await Storage.get({ key: `rating${tea.id}` });
    return {
      ...tea,
      image: `assets/img/${this.images[tea.id - 1]}.jpg`,
      rating: parseInt((rating && rating.value) || '0', 10),
    };
  }
```

But that makes the `getAll()` and `get()` unhappy. The `get()` can be fixed by using the `switchMap()` RxJS operator in place of the `map()` operator.

```typescript
      .pipe(switchMap((tea: any) => this.convert(tea)));
```

The `getAll()` is a little trickier. We still need to use the `switchMap()` operator, but we also need to wrap the array mapping that calls `convert()` in a `Promise.all()` so the `switchMap()` just consumes a single promise and not an array opf them.

```typescript
        switchMap((teas: Array<any>) =>
          Promise.all(teas.map(t => this.convert(t))),
        ),
```

Here is the full code for each:

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http
      .get(`${environment.dataService}/tea-categories`)
      .pipe(
        switchMap((teas: Array<any>) =>
          Promise.all(teas.map(t => this.convert(t))),
        ),
      );
  }

  get(id: number): Observable<Tea> {
    return this.http
      .get(`${environment.dataService}/tea-categories/${id}`)
      .pipe(switchMap((tea: any) => this.convert(tea)));
  }
```

### Save the Rating

The save is relatively easy. It will take a full `Tea` model, but at this time the only thing it will do is save the rating since we do not allow the teas themselves to be changed.

Here is the test covering our requirements:

```typescript
describe('save', () => {
  it('saves the value', () => {
    const tea = { ...expectedTeas[4] };
    tea.rating = 4;
    service.save(tea);
    expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
    expect(Plugins.Storage.set).toHaveBeenCalledWith({
      key: 'rating5',
      value: '4',
    });
  });
});
```

The code to add to the `TeaService` in order to accomplish this is straight forward:

```typescript
  save(tea: Tea): Promise<void> {
    const { Storage } = Plugins;
    return Storage.set({
      key: `rating${tea.id}`,
      value: tea.rating.toString(),
    });
  }
```

Be sure to update the mock factory for this service to reflect the new method.

## Update the Details Page

Now that the component is fully operational, let's update the `TeaDetailsPage` to use it properly rather than just the mock hookup we have now. The first thing we will need to do is add a method to save the rating when it changes.

### Test Modifications

In the page's test, we need to:

- Add the `SharedModule` to the list of imports when configuring the `TestBed`
- Add `rating` property and a test to show it is set on initialization
- Add tests that show the change in rating is applied to the tea and saved

Add the following test to the "initialization" test section:

```typescript
it('sets the rating', () => {
  const route = TestBed.inject(ActivatedRoute);
  const teaService = TestBed.inject(TeaService);
  (teaService.get as any).and.returnValue(
    of({
      id: 42,
      name: 'Yellow',
      image: 'assets/img/yellow.jpg',
      description: 'Yellow tea description.',
      rating: 2,
    }),
  );
  (route.snapshot.paramMap.get as any).and.returnValue('42');
  fixture.detectChanges();
  expect(component.rating).toEqual(2);
});
```

Also add a whole new section for testing a change to the rating:

```typescript
describe('rating changed', () => {
  let teaService: TeaService;
  beforeEach(() => {
    const route = TestBed.inject(ActivatedRoute);
    teaService = TestBed.inject(TeaService);
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
  });

  it('updates the tea', () => {
    component.rating = 4;
    component.ratingChanged();
    expect(component.tea).toEqual({
      id: 42,
      name: 'Yellow',
      image: 'assets/img/yellow.jpg',
      description: 'Yellow tea description.',
      rating: 4,
    });
  });

  it('saves the change', () => {
    component.rating = 4;
    component.ratingChanged();
    expect(teaService.save).toHaveBeenCalledTimes(1);
    expect(teaService.save).toHaveBeenCalledWith({
      id: 42,
      name: 'Yellow',
      image: 'assets/img/yellow.jpg',
      description: 'Yellow tea description.',
      rating: 4,
    });
  });
});
```

### Page Modifications

First add a property called `rating` of type `number`, then modify the `ngOnInit()` slightly so it gets set:

```typescript
  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    this.teaService.get(id).subscribe((t: Tea) => {
      this.tea = t;
      this.rating = t.rating;
    });
  }
```

Next add the `ratingChanged()` method. The code to satisfy the requirements expressed in the above tests is straight forward:

```typescript
  ratingChanged() {
    if (this.tea) {
      this.tea.rating = this.rating;
      this.teaService.save(this.tea);
    }
  }
```

The bindings in the template also need to be modified.

```html
<app-rating [(ngModel)]="rating" (ngModelChange)="ratingChanged()"></app-rating>
```

## Conclusion

Congratulations. You have created and consumed your first reusable component.
