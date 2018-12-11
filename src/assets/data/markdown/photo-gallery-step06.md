# Lab: Take a Picture

In this lab, you will:

- change the color palette
- apply colors to components
- apply custom status bar changes for Android

## Change the Color Palette

The color theme for the application is defined in `src/theme/variables.scss`. Each category of color defines several associated color definitions:

- Base
- RGB
- Contrast
- Contrast RGB
- Shade
- Tint

Ionic Studio makes it easy to redefine the color palatte. Using Ionic Studio's Theming tool, you only need to change the base color for any color category that you wish to change. The other colors definitions for that category are generated. The generated values can be overridden if desired.

In my case, I changed the base color for Primary, Secondary, and Tertiary as follows:

- Primary: `#AA3939`
- Secondary: `#D46A6A`
- Tertiary: `#550000`

I then left the generated values alone. The result is the following colors:

```CSS
  /** primary **/
  --ion-color-primary: #AA3939;
  --ion-color-primary-rgb: 170,57,57;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255,255,255;
  --ion-color-primary-shade: #963232;
  --ion-color-primary-tint: #b34d4d;
  /** secondary **/
  --ion-color-secondary: #D46A6A;
  --ion-color-secondary-rgb: 212,106,106;
  --ion-color-secondary-contrast: #000000;
  --ion-color-secondary-contrast-rgb: 0,0,0;
  --ion-color-secondary-shade: #bb5d5d;
  --ion-color-secondary-tint: #d87979;
  /** tertiary **/
  --ion-color-tertiary: #550000;
  --ion-color-tertiary-rgb: 85,0,0;
  --ion-color-tertiary-contrast: #ffffff;
  --ion-color-tertiary-contrast-rgb: 255,255,255;
  --ion-color-tertiary-shade: #4b0000;
  --ion-color-tertiary-tint: #661a1a;
```

Use Ionic Studio to change the Primary, Secondary, and Tertiary colors based on your own tastes.

## Apply Color to Components

Most components have a color attribute associated with them. The FAB button is already using "primary" by default. Let's change things up a bit.

Make the toolbar use "primary"

```HTML
<ion-header>
  <ion-toolbar color="primary">
    <ion-title>Photo Gallery</ion-title>
  </ion-toolbar>
</ion-header>
```

Make the FAB button use "secondary"

```HTML
  <ion-fab (click)="takePicture()" horizontal="center" vertical="bottom">
    <ion-fab-button color="secondary">
      <ion-icon name="camera"></ion-icon>
    </ion-fab-button>
  </ion-fab>
```

I like that, but now the toolbar is a little dark making the system notifications in the toolbar difficult to read (this is only a problem if you chose a darker Primary color like I did).

If you need to fix this, change the status bar style from Light to Dark in `app.component.ts`. Be sure to update the test file as well. Doing this is left as an exercise to the reader.

## The Android Status Bar

The Android guidelines specify using a different color for the status bar than your appliation uses. The default on my Android device is black, which is OK, but I would like something closer to my primary color. This is an operation we will only want the application to perform when running on Android devices.

The Ionic Framework contains a service called `Platform` that provides information about the platform that the application is currently on. Use this service to determine if the application is running on an Android device. If so, set the background color. I will use the `--ion-color-primary-shade` value.

In the code:

- import the Platform service from `@ionoic/angular`
- inject the Platform service into the page
- use the platform service to determine if the application is running on Android
- if so, set the status bar color

Leaving in just enough code for context, the code changes look like this:

```TypeScript
import { Platform } from '@ionic/angular';

...

  constructor(private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    const { SplashScreen, StatusBar } = Plugins;
    try {
      await SplashScreen.hide();
      await StatusBar.setStyle({ style: StatusBarStyle.Dark });
      if (this.platform.is('android')) {
        StatusBar.setBackgroundColor({ color: '#963232' });
      }
```
