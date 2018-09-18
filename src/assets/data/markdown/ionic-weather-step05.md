# Lab: Styling

In this lab you will:

* Apply defined colors to elements
* Change the default color theme
* Apply global styles
* Customize the application's splash screen and icon


## Setting a Color Theme

**Remember to create a branch:** `git checkout -b feature/style`

Let's give our app a little color. We will start by just using the default "primary" color for the nav bar and the tab bar.

For each of the main pages, add `color="primary"` to the `ion-navbar` element like this:

```html
<ion-header>
  <ion-navbar color="primary">
    <ion-title>Current Weather</ion-title>
  </ion-navbar>
</ion-header>
```

Make a similar modification to the `tabs.html` file:

```html
<ion-tabs color="primary">
  <ion-tab [root]="tab1Root" tabTitle="Current Weather" tabIcon="cloud"></ion-tab>
  <ion-tab [root]="tab2Root" tabTitle="Forecast" tabIcon="calendar"></ion-tab>
  <ion-tab [root]="tab3Root" tabTitle="UV Index" tabIcon="sunny"></ion-tab>
</ion-tabs>
```

Now let's supply some of our own custom colors.

First, set the background color for all `content` regions in `app.scss`:

```scss
.content {
  background-color: #b9dbf7;
}
```

Second, use a slightly different shade of blue for the `primary` color in `theme/variables.scss`:

```scss
$colors: (
  primary: #085A9E,
  secondary: #32db64,
  danger: #f53d3d,
  light: #f4f4f4,
  dark: #222
);
```

## Changing the Splash Screen and Icon

Your application should have its own splash screen and icon rather than using the default that Ionic supplies for you. Ionic provides a service that will take two source image files and create all of the resources that your application will require. Follow these guidelines:

* Keep the images simple and clear
* You can supply source images in any of these format: .png, .psd, .ai
* Icon - at least 1024x1024 pixels
* Splashscreen - at least 2732x2732 pixels with a simple image that is centered and no bigger than 1200x1200 pixels to facilitate reasonable display on all devices

For this application, we download the following images and copy them to your application's `resources` directory, replacing the onces that are already there:

* <a download href="/assets/images/icon.png">icon.png</a>
* <a download href="/assets/images/splash.png">splash.png</a>

Run `ionic cordova resources` to generate new resources.

Rather than doing another commit, let's just amend the previous commit with these changes: `git commit -a --amend -C HEAD` (or `git aa` if you have my aliases)

## Finish the Feature

At this point, you can merge your change into `master` and remove your feature branch. Remeber to push to both of your remotes.

After the Ionic Pro build is complete and assigned to the Master channel, relaunch the application on your device. You will notice that the theme has changed. **But wait!!** The splash screen and icon have not. Why is that?

The Ionic Deploy service can only deploy <a href="https://ionic.zendesk.com/hc/en-us/articles/360002243614-What-Are-Binary-Compatible-Changes-" target="_blank">binary compatible changes</a>. While the icon and splash screen may sound like they are "assets", and thus binary compatible, they really are not. They are actually bundled with the binary portion of the application. Thus, to deploy the change to the icon and splash screen, you need to re-submit the application to the app stores (or in our case, reload the application on your device).