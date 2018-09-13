# Lab: Lazy Loading

The application so far loads two primary JavaScript files: `main.js` which contains all of the code that we wrote and `vendor.js` which contains most of our third party libraries. This means that the JavaScript for all of pages is being loaded and parsed up front. So the JavaScript for the "UV Index" page is loaded and parsed even if the user never visits that page. It would be better if that JavaScript were only loaded and parsed if the user visited the screen. That is where lazy loading comes in.

**Note:** in the case of hybrid native applications, the JavaScript is being loaded from the local filesystem, so the load time is not an issue at all. On slower Android devices, however, the parse time can be significant.

Also, the application we have here is small enough where none of this is likely to be significant. In a more typical larger application, the difference can be quite a bit.

## General Steps

In Ionic v3 applications, lazy loading is done on a page by page basis. This is the only way to configure lazy loading. The general steps you need to take in order to switch the application from eager loaded to lazy loaded are:

1. create a module for each page
1. add the IonicPage() decorator to each page
1. remove direct references to the pages
1. clean up the modules

### Create a Module for Each Page

Each page must have its own module. The basic module file looks like this:

```TypeScript
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CurrentWeatherPage } from './current-weather';

@NgModule({
  declarations: [CurrentWeatherPage],
  imports: [IonicPageModule.forChild(CurrentWeatherPage)],
  entryComponents: [CurrentWeatherPage]
})
export class CurrentWeatherPageModule {}
```

Create one for each page. Do not import any of these modules anywhere. That would defeat the lazy loading.


### Add the `IonicPage()` Decorator

Each page needs to have the `@IonicPage()` decorator. This decorator can be added right above the already existing `@Component()` decorator and can usually be used without any configuration object. See <a href="https://ionicframework.com/docs/api/navigation/IonicPage/" target="_blank">the IonicPage documentation</a> for further details about this decorator and its configuration object.


### Remove Direct References

There are two basic changes here:

1. remove all traces of your pages from `app.module.ts`, they are no longer needed
1. in other pages that reference the page class (usually for navigation), replace the reference by class with a string (be sure to remove the `import` as well)

The change of references from the page class to a string looks like this:

```diff
diff --git a/src/app/app.component.ts b/src/app/app.component.ts
index 4a504e0..e41cf52 100644
--- a/src/app/app.component.ts
+++ b/src/app/app.component.ts
@@ -3,13 +3,11 @@ import { Platform } from 'ionic-angular';
 import { StatusBar } from '@ionic-native/status-bar';
 import { SplashScreen } from '@ionic-native/splash-screen';

-import { TabsPage } from '../pages/tabs/tabs';
-
 @Component({
   templateUrl: 'app.html'
 })
 export class MyApp {
-  rootPage: any = TabsPage;
+  rootPage: any = 'TabsPage';

   constructor(
     platform: Platform,
```

This change needs to occur wherever the pages are referenced, so search the references out in the code and change them to string like this.

### Clean Up the Modules

At this point you should see an error message that is roughly the same length as a small novel. The problem here is that every page is now it its own `NgModule` which means that each of those `NgModules` need to:

1. include the `CUSTOM_ELEMENTS_SCHEMA` if they use any custom elements (all of our pages except `TabsPage` do)
1. include any components, pipes, etc. that we use in those pages

When we are done, the `NgModule` for our three child pages (not the `TabsPage`) should look like this:

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CurrentWeatherPage } from './current-weather';

@NgModule({
  declarations: [CurrentWeatherPage],
  imports: [IonicPageModule.forChild(CurrentWeatherPage)],
  entryComponents: [CurrentWeatherPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CurrentWeatherPageModule {}
```