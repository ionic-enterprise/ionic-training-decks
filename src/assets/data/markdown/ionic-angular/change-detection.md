# Lab: Use "On Push" Change Detection

In this lab you will learn how to:

- Switch from the default change detection strategy to "OnPush"
- Manually trigger change detection when required
- Use the async pipes to manage observable data

## Use the OnPush Change Detection Strategy

On the three main pages, change the Change Detection Strategy to `OnPush`:

```TypeScript
import { ChangeDetectionStrategy, Component } from '@angular/core';

...

@Component({
  selector: 'app-forecast',
  templateUrl: 'forecast.page.html',
  styleUrls: ['forecast.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
}
```

But now if as you navigate the application you will notice that the pages do not display any data.

## Explicitly Calling Change Detection

**Do not actually do this!!** This is just something you *could* do, but there is a better way...

We *could* change the pages to explicitly call the change detection when the data comes back: 

**`weather-page-base.ts`**

```TypeScript
import { ChangeDetectorRef } from '@angular/core';
...
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private loadingController: LoadingController,
    protected userPreferences: UserPreferencesService,
    private fetch: () => Observable<T>
  ) {}

...

    this.fetch().subscribe(d => {
      this.data = d;
      loading.dismiss();
      this.changeDetectorRef.detectChanges();
    });
```

But don't. There is a better way.

## Use the Async Pipe

Rather than explicitly kicking off a change detection cycle, we will use the `async` pipe. This pipe has several advantanges over the way we are currently obtaining data:

- it automatically manages the subscription, including unsubscribing when necessary
- it is compatible with OnPush change detection in that it will kick off a change detection cycle when necesssary

### Clean up the Tests

First we will need to clean up the page tests. Several of them use `async/await` because of the loading indicator using promises. We will be modifying this whole workflow to be part of an `Observable` pipeline, so `async/await` will no longer be appropriate. Instead, use the `fakeAsync()` zone and `tick()` as such (**note** you do not need to change the "user preferences" related tests):

**`async/await` Test**

```TypeScript
    it('displays a loading indicator', async () => {
      const loadingController = TestBed.inject(LoadingController);
      await component.ionViewDidEnter();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loading.present).toHaveBeenCalledTimes(1);
    });
```

**`fakeAsync` Zone Test**

```TypeScript
    it('displays a loading indicator', fakeAsync(() => {
      const loadingController = TestBed.inject(LoadingController);
      component.ionViewDidEnter();
      tick();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loading.present).toHaveBeenCalledTimes(1);
    }));
```

### Change the Code

**`src/app/weather-page-base/weather-page-base.ts`**

The bulk of the changes are in the base class

The `data` is no longer of type `T`, but is now an Observable of type `T`. Since it is an Observable, we also rename it to `data$` by convension. We will also create a private Subject that will be used to refresh the data.

```TypeScript
  private refresh: Subject<void>;
  data$: Observable<T>;
```

In the constructor, we will create the subject and construct the full Observable.

```TypeScript
    this.refresh = new Subject();
    this.data$ = this.refresh.pipe(flatMap(() => this.getData()));
```

When we enter the view we want to refresh the data. We will get the current scale preference and then trigger a refresh.

```TypeScript
  ionViewDidEnter() {
    this.refresh.next();
  }
```

Finally, the getting of the data is turned into an Observable pipeline

```TypeScript
  private getData(): Observable<T> {
    let loading;
    return from(this.showLoading())
      .pipe(
        flatMap(l => {
          loading = l;
          return this.fetch();
        })
      )
      .pipe(tap(() => loading.dismiss()));
  }
```

Depending on how you had coded your base class before, the creation of the loading indicator may not be in its own method. For referenence, here is my `showLoading()` method: 

```TypeScript
  private async showLoading() {
    const l = await this.loadingController.create({ message: 'Getting Weather' });
    await l.present();
    return l;
  }
```

The final change we need to make is to the HTML for the views.

For view like the forcast page that uses `ngFor` to iterate over a collection, the change is easy. The name of the collection changes to include the `$`, and we pipe it through the `async` pipe. This `<ion-item *ngFor="let f of data">` becomes this `<ion-item *ngFor="let f of data$ | async">`

For views like the current weather page and the UV index page, we will wrap the existing markup with a `div` that uses `ngIf` to get the data. Here is an example from the UV index page.

```HTML
  <div *ngIf="data$ | async as data">
    <kws-uv-index class="primary-value" [uvIndex]="data.value"></kws-uv-index>
    <div class="description">{{ advice[data.riskLevel] }}</div>
  </div>
```

## Conclusion

You're application now uses OnPush change detection. I think we can call version 1.0 complete!
