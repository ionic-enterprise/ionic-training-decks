# Lab: User Preferences Phase 1

In this lab you will learn how to:

- Create a component using the Ionic CLI
- Add icon buttons to the navbar
- Use the ModalController to create a modal
- Override styles locally
- Dismiss the modal
- Hookup some form controls

## Create the Modal

When a modal is created, a component is specified to use within the modal window. This component should be in its own module in order to allow it to be lazy loaded. In order to do this easily, use the `--createModule` flag when generating the component.

```bash
$ ionic g component user-preferences --createModule
```

Examine the generated code.

Notice that the generated NgModule imports Angular's `FormsModule`. Without that import, you would not be able to use `ngModel` as such `<ion-toggle [(ngModel)]="useCelcius"></ion-toggle>`, which we will do later.
## Import the Module

In order to use the `UserPreferencesComponent` that was just created, the `UserPreferencesComponentModule` needs to be imported where it is used. Import `UserPreferencesComponentModule` in the NgModule files for each of the three main pages of the application, as they will all use the `UserPreferencesComponent`.

## Hook Up the Modal

The user preferences will be accessible via each page's header via a gear button. The markup to accomplish this looks like:

```http
    <ion-buttons slot="primary">
      <ion-button (click)="openUserPreferences()">
        <ion-icon slot="icon-only" name="settings"></ion-icon>
      </ion-button>
    </ion-buttons>
```

Add this within the `ion-toolbar` in the header of each page other than `tabs.page.html`. Don't worry about the red squiggly line under `openUserPreferences()`. We will fix that next.

The class for each page we just updated will need code like this:

```TypeScript
  async openUserPreferences(): Promise<void> {
    const m = await this.modal.create({ component: UserPreferencesComponent });
    await m.present();
  }
```

This requires injecting a `ModalController` as `modal` in the constructor. Do this in each page class (other than `TabsPage`).

Once you do this, test out the application. Upon pressing the gear your application should crash. Something isn't right here. Angular doesn't know how to find the component you just created. Have a look at the error message and see if you can figure out what to do.

**Hint:** a change is needed in `user-preferences.module.ts`

## Add a Header and Footer

The general format of a page or modal dialog component is:

```HTML
<ion-header>
</ion-header>

<ion-content>
</ion-content>

<ion-footer>
</ion-footer>
```

Replace the HTML in the `UserPreferencesComponent` to match this.

The header will be very similar to the headers used on the pages, so copy the header from one of the pages for now. Make the following modifications:

- Change the title to "User Preferences"
- Change the icon button to use the "close" icon
- Change the method that it calls when handling the click event to "dismiss()"
- Create a stub method called "dismiss()" in the component's class

The footer will be filled in later, so leave it blank.

Finally, let's override some styles just for the modal component. Along with giving the modal a different look on a phone, this will also make the modal more obvious when run on the web or on a tablet.

```scss
:host {
  --ion-background-color: white;
}
```

## Implement the `dismiss()` Method

In the previous step, you mocked up a `dismiss()` method, but it really should dismiss the modal. This can be done by injecting the `ModalController`, which will inject the controller for the current modal. That controller has method called `dismiss()`.

**Challenge:** inject the `ModalController` and dismiss the view from the `UserPreferenceComponent` `dismiss()` method.

## Add a Button to the Footer

The footer is a good place to put a "Save" or "OK" button. Add a save button like this:

```html
<ion-toolbar>
  <ion-button expand="block" color="secondary" (click)="save()"
    >Save</ion-button
  >
</ion-toolbar>
```

Create a stub for the `save()` method.

## User Preferences

Let's allow the users to select two simple options just for illustration:

1. Use Celcius
1. Specify a specific city or just use the current location

### Models

Create a city model in the `models` folder like this:

```TypeScript
import { Coordinate } from './coordinate';

export interface City {
  name: string;
  coordinate?: Coordinate;
}
```

In the user prefrences folder, let create an array of cities. This is the only place that will use the data, but we will keep in its own file in order to keep the component class clean:

**`src/components/user-preferences/cities.ts`**

```TypeScript
import { City } from '../models/city';

export let cities: Array<City> = [
  { name: 'Current Location' },
  {
    name: 'Chicago, IL',
    coordinate: { latitude: 41.878113, longitude: -87.629799 }
  },
  {
    name: 'Edmonton, AB',
    coordinate: { latitude: 53.544388, longitude: -113.490929 }
  },
  {
    name: 'London, UK',
    coordinate: { latitude: 51.507351, longitude: -0.127758 }
  },
  {
    name: 'Madison, WI',
    coordinate: { latitude: 43.073051, longitude: -89.40123 }
  },
  {
    name: 'Milwaukee, WI',
    coordinate: { latitude: 43.038902, longitude: -87.906471 }
  },
  {
    name: 'Orlando, FL',
    coordinate: { latitude: 28.538336, longitude: -81.379234 }
  },
  {
    name: 'Ottawa, ON',
    coordinate: { latitude: 45.42042, longitude: -75.69243 }
  }
];
```

### Mock Up the Component

The content of the user preferences modal should have a toggle for the "Use Celcius" option and selection for the city for which the user wants to get the weather. That will require defining a few properties:

- `import { City } from '../models/city';`
- `import { cities } from './cities';`
- `cities: Array<City> = cities;`
- `city: City = this.cities[0];`
- `useCelcius: boolean;`

**Note:** the `import`s are defined at the top of the file, the properties are defined within the class for the component.

In the view, markup is required for the user controls. The two-way binding via `ngModel` is used to set the data and get changes from the user.

```http
<ion-content>
  <ion-list>
    <ion-item>
      <ion-label>Use Celcius</ion-label>
      <ion-toggle [(ngModel)]="useCelcius"></ion-toggle>
    </ion-item>

    <ion-item>
      <ion-label>Location</ion-label>
      <ion-select [(ngModel)]="city">
        <ion-select-option *ngFor="let city of cities" [value]="city">{{city.name}}</ion-select-option>
      </ion-select>
    </ion-item>
  </ion-list>
</ion-content>
```

Modify the `save()` method to log the `city` and `useCelcius` data to the console and then close the modal.

## Conclusion

At this point, we what looks like a functional user preferences dialog, but it does not actually do anything. We will fix that in the next lab.
