# Lab: Create a Rating Component

In this lab you will:

- Create a `shared` module
- Add a reusable component to the `shared` library
- Use the component in the details page

## Create the `SharedModule`

A common convention in Angular application is to use a <a href="https://angular.io/guide/ngmodule-faq#sharedmodule" target="_blank">`SharedModule`</a> containing components, directives, and pipes that are used throughout the application.

Create a shared module, and then create the rating component in the same folder

```bash
ionic g module shared
ionic g component shared/rating
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

**Note:** as we go through this, take the time at each step to see how this affects the display and behavior of the component on the page.

First let's just get a row of five stars out there:

```html
<div>
  <ion-icon *ngFor="let n of [1, 2, 3, 4, 5]" name="star"></ion-icon>
</div>
```

Next, add a `rating` property to the class and give it a value greater than zero but less then 5. Change the markup to that number of filled in stars with the rest being outline stars.

```html
<div>
  <ion-icon
    *ngFor="let n of [1, 2, 3, 4, 5]"
    [name]="n > (rating || 0) ? 'star-outline' : 'star'"
  ></ion-icon>
</div>
```

Finally, let's add a `click` handler that will change the rating as the user clicks on a star:

```html
<div>
  <ion-icon
    *ngFor="let n of [1, 2, 3, 4, 5]"
    [name]="n > (rating || 0) ? 'star-outline' : 'star'"
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
  padding-right: 0px;
}
```

### Integrate with NgModel

If we make our component implement the `ControlValueAccessor` interface, it will automatically work in forms nicely and support two-way bindings with `[(ngModel)]`.

First let's scaffold out the code a little to get the boiler-plate stuff:

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
  @Input() rating: number;

  constructor() {}

  onChange = (_rating: number) => {};

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

Let's also scaffold the test. This one will be a little more complex because we want to test out how the component behaves when it is used, so we will need to create a host component for our tests.

```typescript
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
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

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [RatingComponent, TestHostComponent],
        imports: [FormsModule, IonicModule],
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostComponent);
      hostComponent = fixture.componentInstance;
      ratingEl = fixture.nativeElement.querySelector('app-rating');
      fixture.detectChanges();
    }),
  );

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
    [name]="n > (rating || 0) ? 'star' : 'star-outline'"
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

It would be good if we could allow this component to be disabled. When we do this, we should reduce the opacity to make it look "grayed out", and we should disabled clicks. Add a test to the "when enabled" section of the test.

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

We need to modify the `TeaService` to both save and retrieve the rating for each tea. Our backend API does not currently support the rating on a tea, so we will store this data locally using the Capacitor Storage API. Our tasks for this will include:

- Add an optional `rating` property to the `Tea` model
- Modify the tea service
  - get the rating in the `getAll()`
  - add a `save()` routine to save the rating
- Update the store to handle the data flow
- Modify the tea details page to dispatch an action to the store when the rating is changed

### Update the Model

Update `src/app/models/tea.ts` and add the following property:

```typescript
  rating?: number;
```

### Update the Service

We need to do two things in the service:

- update the `getAll()` to include the rating
- add a `save()` routine

#### Update the `getAll()`

##### Modify the Test Data

In the `expectedTeas` array that is part of the `TeaService` test, add a rating to each tea as shown. For some of them, use zero. This will be the default value for teas that do not yet have a rating.

```typescript
      {
        id: 1,
        name: 'Green',
        image: 'assets/img/green.jpg',
        description: 'Green tea description.',
        rating: 4
      },
```

The rating is not part of the data coming back from our API, so the API results we use cannot have it. Where the `resultTeas` array is defined, delete the `rating` just like we do for the `image`.

```typescript
resultTeas = expectedTeas.map((t: Tea) => {
  const tea = { ...t };
  delete tea.image;
  delete tea.rating;
  return tea;
});
```

##### Set up the Storage Mock

We will use the Capacitor Storage plugin, so we will mock that. There are multiple ways that we could store the ratings. We will just go with the very simple strategy of using a key of `ratingX` where `X` is the `ID` of the tea.

In the main `beforeEach()`, spy on `Storage.get()` returning a default of `{ value: '0' }` and add non-zero values for various ratings depending on the changes you made to the test data above.

```typescript
...
import { Plugins } from '@capacitor/core';
...
let originalStorage: any;
...
beforeEach(() => {
  initializeTestData();
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  });
  httpTestingController = TestBed.inject(HttpTestingController);
  service = TestBed.inject(TeaService);
  spyOn(Storage, 'get')
    .and.returnValue(Promise.resolve({ value: '0' }))
    .withArgs({ key: 'rating1' })
    .and.returnValue(Promise.resolve({ value: '4' }))
    // repeat for all expectedTeas with a non-zero rating
    // the key is `rating${id}}`
    .withArgs({ key: 'rating6' })
    .and.returnValue(Promise.resolve({ value: '5' }));
});
```

We are also going to have to combine code that returns an `Observable` with code that resolves a `Promise`. In order to deal with this cleanly, wrap the tests that perform a `flush()` in the `fakeAsync` zone and call `tick()` after the `flush()` as such:

```typescript
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

That test case should probably have a more generic name as well. Something like "transforms each tea".

##### Write the Code

At this point, you should have a failing test. Update the code in `src/app/core/tea/tea.service.ts` to make it pass.

The first step is to make our private `convert()` method async and then grab the rating from storage:

```typescript
  private async convert(res: any): Promise<Tea> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const rating = await Storage.get({ key: `rating${res.id}` });
    return {
      ...res,
      image: `assets/img/${this.images[res.id - 1]}.jpg`,
      rating: parseInt((rating && rating.value) || '0', 10),
    };
  }
```

But this makes our `getAll()` method unhappy. We are not returning an Observable of an array of promises of tea, but we want an array of teas, not just the promise of eventually getting tea. We can use a `mergeMap()` in conjunction with a `Promise.all()` to fix this:

```typescript
  getAll(): Observable<Array<Tea>> {
    return this.http
      .get(`${environment.dataService}/tea-categories`)
      .pipe(
        mergeMap((teas: Array<any>) =>
          Promise.all(teas.map(t => this.convert(t))),
        ),
      );
  }
```

Reading that code from the inside out:

- `convert()` takes a raw tea and converts it to our model, but needs to do so async, so it returns a promise of that conversion
- `Promise.all()` takes all of those promises of conversions and groups them into a single promise that resolve to an array of teas once all of the inner promises resolve
- `mergeMap()` converts that promise to an Observable and returns it instead of the original Observable from the HTTP call

#### Save the Rating

The save is relatively easy. It will take a full `Tea` model, but at this time the only thing it will do is save the rating since we do not allow the teas themselves to be changed.

Here is the test covering our requirements:

```typescript
describe('save', () => {
  it('saves the value', () => {
    spyOn(Storage, 'set');
    const tea = { ...expectedTeas[4] };
    tea.rating = 4;
    service.save(tea);
    expect(Storage.set).toHaveBeenCalledTimes(1);
    expect(Storage.set).toHaveBeenCalledWith({
      key: 'rating5',
      value: '4',
    });
  });
});
```

The code to add to the `TeaService` in order to accomplish this is straight forward:

```typescript
  save(tea: Tea): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { Storage } = Plugins;
    return Storage.set({
      key: `rating${tea.id}`,
      value: tea.rating.toString(),
    });
  }
```

Be sure to update the mock factory for this service to reflect the new method.

### Update the Store

#### Actions

We will need a new action to signify that the user has changed the rating on a tea. Notice that it is tied to this page. Also notice that our `actions.ts` file is getting a little large. We may want to look at reorganizing how that is laid out at some point, but for now let's continue to run with the single file.

```TypeScript
export const teaDetailsChangeRating = createAction(
  '[Tea Details Page] change rating',
  props<{ tea: Tea; rating: number }>(),
);
export const teaDetailsChangeRatingSuccess = createAction(
  '[Data API] change rating success',
  props<{ tea: Tea }>(),
);
export const teaDetailsChangeRatingFailure = createAction(
  '[Data API] change rating failure',
  props<{ errorMessage: string }>(),
);
```

#### Reducer

For the reducer we need to update the state with the updated tea if the rating change succeeded, and with the error message if it failed.

The `src/app/store/reducers/data.reducer.spec.ts` file defines some test teas. Add a rating to each. Then add the following test cases. Note that we only need to handle the "success" and "failure" actions (remember to adjust the imports at the top of the test file for the new actions):

```TypeScript
  {
    description: 'Tea Details Change Rating Success: sets the rating for the tea',
    action: teaDetailsChangeRatingSuccess({ tea: {...teas[1], rating: 3} }),
    begin: { teas },
    end: { teas: [teas[0], { ...teas[1], rating: 3 }, teas[2]] },
  },
  {
    description: 'Tea Details Change Rating Failure: sets the error message',
    action: teaDetailsChangeRatingFailure({ errorMessage: 'The save blew some chunks' }),
    begin: { teas },
    end: { teas, errorMessage: 'The save blew some chunks' },
  },
```

Here is one way of doing that:

```TypeScript
  on(Actions.teaDetailsChangeRatingSuccess, (state, { tea }) => {
    const teas = [...state.teas];
    const idx = state.teas.findIndex(t => t.id === tea.id);
    if (idx > -1) {
      teas.splice(idx, 1, tea);
    }
    return { ...state, teas };
  }),
  on(Actions.teaDetailsChangeRatingFailure, (state, { errorMessage }) => ({
    ...state,
    errorMessage,
  })),
```

#### Effect

The effect that we require is pretty straight forward:

- save the tea
- dispatch the next action based on whether or not the save succeeded

```TypeScript
  describe('teaRatingChanged$', () => {
    it('saves the tea', done => {
      const teaService = TestBed.inject(TeaService);
      actions$ = of(teaDetailsChangeRating({ tea: teas[1], rating: 5 }));
      effects.teaRatingChanged$.subscribe(() => {
        expect(teaService.save).toHaveBeenCalledTimes(1);
        expect(teaService.save).toHaveBeenCalledWith({ ...teas[1], rating: 5 });
        done();
      });
    });

    describe('on success', () => {
      it('dispatches tea rating change success', done => {
        actions$ = of(teaDetailsChangeRating({ tea: teas[1], rating: 5 }));
        effects.teaRatingChanged$.subscribe(newAction => {
          expect(newAction).toEqual({
            type: '[Data API] change rating success',
            tea: { ...teas[1], rating: 5 },
          });
          done();
        });
      });
    });

    describe('on an exception', () => {
      beforeEach(() => {
        const teaService = TestBed.inject(TeaService);
        (teaService.save as any).and.returnValue(
          Promise.reject(new Error('private storage is blowing chunks?')),
        );
      });

      it('dispatches tea rating change failure', done => {
        actions$ = of(teaDetailsChangeRating({ tea: teas[1], rating: 5 }));
        effects.teaRatingChanged$.subscribe(newAction => {
          expect(newAction).toEqual({
            type: '[Data API] change rating failure',
            errorMessage: 'private storage is blowing chunks?',
          });
          done();
        });
      });
    });
  });
```

Here is the code:

```TypeScript
  teaRatingChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(teaDetailsChangeRating),
      mergeMap(action =>
        from(
          this.teaService.save({ ...action.tea, rating: action.rating }),
        ).pipe(
          map(() =>
            teaDetailsChangeRatingSuccess({
              tea: { ...action.tea, rating: action.rating },
            }),
          ),
          catchError(err =>
            of(
              teaDetailsChangeRatingFailure({
                errorMessage: err.message || 'Unknown error in rating save',
              }),
            ),
          ),
        ),
      ),
    ),
  );
```

## Update the Details Page

Now that everything is fully operational, let's update the `TeaDetailsPage` to use it properly rather than just the mock hookup we have now.

### Grab the Current Rating

The first thing we will need to do is get the current rating when we select the tea. We need to do this because we cannot just bind directly to `tea.rating` in our view. The component modifying that value would directly modify the state, and that is not allowed.

Add a rating to our test tea.

```TypeScript
      store.overrideSelector(selectTea, {
        id: 7,
        name: 'White',
        description: 'Often looks like frosty silver pine needles',
        image: 'imgs/white.png',
        rating: 4,
      });
```

Then add a test to verify the initialization of the rating value. Similar to the previously modified test, this is also in the "initialization" describe block

```TypeScript
    it('initializes the rating', () => {
      fixture.detectChanges();
      expect(component.rating).toBe(4);
    });
```

Then in the code we can tap into the Observable pipeline and grab the rating:

```TypeScript
...
  rating: number;
...
    this.tea$ = this.store
      .select(selectTea, { id })
      .pipe(tap(tea => (this.rating = tea && tea.rating)));
```

We can then bind the rating in the template:

```HTML
<app-rating [(ngModel)]="rating"></app-rating>
```

**Note:** this causes a couple of warnings in our test, but we can get around those by importing the `FormsModule` when we configure the test module.

### Save the New Rating

When the user clicks on the rating component, we need to dispatch the change to the store. Here is the test, code, and template markup change.

```TypeScript
describe('rating click', () => {
  let store: MockStore;
  let tea: Tea;
  beforeEach(() => {
    tea = {
      id: 7,
      name: 'White',
      description: 'Often looks like frosty silver pine needles',
      image: 'imgs/white.png',
      rating: 4,
    };
    store = TestBed.inject(Store) as MockStore;
    store.overrideSelector(selectTea, tea);
    fixture.detectChanges();
  });

  it('dispatches a rating change action', () => {
    spyOn(store, 'dispatch');
    component.rating = 3;
    component.changeRating(tea);
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(
      teaDetailsChangeRating({ tea, rating: 3 }),
    );
  });
});
```

```TypeScript
changeRating(tea: Tea) {
  this.store.dispatch(teaDetailsChangeRating({ tea, rating: this.rating }));
}
```

```HTML
<app-rating [(ngModel)]="rating" (click)="changeRating(tea)"></app-rating>
```

## Conclusion

Congratulations. You have created and consumed your first reusable component.
