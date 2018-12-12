# Lab: User Preferences Step 1

In this lab you will learn how to:

* create a component using the Ionic CLI
* add icon buttons to the navbar
* use the ModalController to create a modal
* override styles locally
* use the ViewController to dismiss the modal
* hookup some form controls

## Create the Modal

In order to launch a modal, a component to display in the modal needs to be specified. We can create the via `ionic g component user-preferences`.

Do that and examine the generated code.

## Hook Up the Modal

The user preferences will be accessible via each page's header via a gear button. The markup to accomplish this looks like:

```http
    <ion-buttons end>
      <button ion-button icon-only (click)="openUserPreferences()">
        <ion-icon name="settings"></ion-icon>
      </button>
    </ion-buttons>
```

Add this within the `ion-navbar` in the header of each page. Don't worry about the red squiggly line under `openUserPreferences()`. We will fix that next.

Each page class will need code like this:

```TypeScript
  openUserPreferences() {
    const m = this.modal.create(UserPreferencesComponent);
    m.present();
  }
```

This requires injecting a `ModelController` as `modal` in the constructor. Do this in each page class.

Once you do this, test out the application. Upon pressing the gear your application should crash. Something isn't right here. Angular doesn't know how to find the component you just created. You need to do two things:

1. in the `app.module.ts` file, add the newly created `ComponentsModule` to the `imports` section of the `ngModule`
1. in `src/components/components.module.ts`, specify the `UserPreferencesComponent` in the `entryComponents` array on the `NgModule` (you will likely have to add the property to the config object that is specified in the decorator)

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

* change the title to "user preferences"
* change the icon button to use the "close" icon
* change the method that it calls when handling the click event to "dismiss()"
* create a stub method called "dismiss()" in the component's class

The footer will be filled in later, so leave it blank.

Finally, let's override some styles just for the modal component. Along with giving the modal a different look on a phone, this will also make the modal more obvious when run on the web or on a tablet. 

```scss
user-preferences {
  .footer {
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 5px;
  }

  .item {
    background-color: white;
  }

  .content {
    background-color: white;
  }
}
```

## Implement the `dismiss()` Method

In the previous step, you mocked up a `dismiss()` method, but it really should dismiss the modal. This can be done by injecting the  `ViewController`, which will inject the controller for the current view. That controller has method called `dismiss()`.

**Challenge:** inject the `ViewController` and dismiss the view from the `UserPreferenceComponent` `dismiss()` method.

## Add a Button to the Footer

The footer is a good place to put a "Save" or "OK" button. Add a save button like this: `<button ion-button block color="secondary">Save</button>`

There are a couple of things I don't like about the button. First, that green is a very ugly secondary color considering the rest of our theme and second it looks a little crowded.

1. change the value of the "secondary" color of our theme to be `#f58e00`
1. add some padding to the footer for this component only (I suggest right and left padding of 10px and bottom padding of 5px)

## User Preferences

Let's allow the users to select two simple options just for illustration:

1. Use Celcius
1. Specify a specific city or just use the current location

### Models

Create a city model in the `models` folder like this:

```TypeScript
import { Location } from './location';

export interface City {
  name: string;
  location?: Location;
}
```

In the user prefrences folder, let create an array of cities. This is the only place that will use the data, but we will keep in its own file in order to keep the component class clean:

**`src/components/user-preferences/cities.ts`**

```TypeScript
import { City } from '../../models/city';

export let cities: Array<City> = [
  { name: 'Current Location' },
  {
    name: 'Chicago, IL',
    location: { latitude: 41.878113, longitude: -87.629799 }
  },
  {
    name: 'Edmonton, AB',
    location: { latitude: 53.544388, longitude: -113.490929 }
  },
  {
    name: 'London, UK',
    location: { latitude: 51.507351, longitude: -0.127758 }
  },
  {
    name: 'Madison, WI',
    location: { latitude: 43.073051, longitude: -89.40123 }
  },
  {
    name: 'Milwaukee, WI',
    location: { latitude: 43.038902, longitude: -87.906471 }
  },
  {
    name: 'Orlando, FL',
    location: { latitude: 28.538336, longitude: -81.379234 }
  },
  {
    name: 'Ottawa, ON',
    location: { latitude: 45.42042, longitude: -75.69243 }
  }
];
```

### Mock Up the Component

The content of the user preferences modal should have a toggle for the "Use Celcius" option and selection for the city for which the user wants to get the weather. That will require defining a few properties:

* `import { cities } from './cities';`
* `cities: Array<City> = cities;`
* `city: City = this.cities[0];`
* `useCelcius: boolean;`

**Note:** the `import` is at the top of the file, the properties are defined within the class for the component.

Also create a `save()` method that just logs out some values:

```TypeScript
  save() {
    console.log('city:', this.city);
  }
```

In the view, markup is required for the user controls. The two-way binding via `ngModel` is used to set the data and get changes from the user.

```http
<ion-content>
  <ion-list>
    <ion-item>
      <ion-label>Use Celcius</ion-label>
      <ion-toggle [(ngModel)]="userCelcius"></ion-toggle>
    </ion-item>

    <ion-item>
      <ion-label>Location</ion-label>
      <ion-select [(ngModel)]="city">
        <ion-option *ngFor="let city of cities" [value]="city">{{city.name}}</ion-option>
      </ion-select>
    </ion-item>
  </ion-list>
</ion-content>
```

Also hookup the `save()` method via the save button's click event.
