# Lab: Use a Library

In this lab, you will learn how to:

* Install third party libraries
* Integrate the third party libraries into your application
* Maintain the application's dependencies

## Install the Library

It is often useful to use third party libraries. For this application, we will use a library of <a href="https://github.com/kensodemann/kws-weather-widgets" target="_blank">weather related components</a> that I created and published on NPM. Many useful JavaScript libraries are availble via NPM and are available for use in your application.

To install my weather component library, run: `npm install kws-weather-widgets`

The library is installed in `node_modules` and your `package.json` file is updated to reflect the new dependency:

```JSON
    "kws-weather-widgets": "~2.0.2",
```

## Use the Library

Good libraries usually document exactly how to use the library in your application. In the case of this library - which is a web component library built using a technology called <a href="https://stenciljs.com" target="_blank">Stencil</a> - there are a couple of steps that need to be taken to use the library in an Angular project (like yours).

First, there is a method in the library called `defineCustomElements()` that needs to be run. This is usually run in the `main.ts` file. This method contains the special sauce that bundlers like WebPack need in order to be aware of the components, with the end result being that WebPack will bundle them properly.

```TypeScript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from 'kws-weather-widgets/loader';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
defineCustomElements(window);
```

Second, since Angular does not know about the custom elements in the library, the `CUSTOM_ELEMENTS_SCHEMA` must be used in each module that uses any components from the library. This tells the Angular compiler to ignore any elements it doesn't understand so long as they conform to the custom elements standard.

For each of the three main pages in our application, we need to make a change similar to the following to each of their `module.ts` files:

```TypeScript
...
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
...

@NgModule({
  ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CurrentWeatherPageModule {}
```

## Maintaining Dependencies

NPM is also used to maintain the application's dependencies. If you type `npm outdated` from the root directory of your project you can see which dependencies may need upgrading.

You will see something like this, with the actual contents varrying over time.


```
~/Projects/Training/ionic-weather (master *): npm outdated
Package                             Current    Wanted    Latest  Location
@angular-devkit/architect            0.12.3    0.12.4    0.13.4  ionic-weather
@angular-devkit/build-angular        0.12.3    0.12.4    0.13.4  ionic-weather
@angular-devkit/core                  7.2.3     7.2.4     7.3.4  ionic-weather
@angular-devkit/schematics            7.2.3     7.2.4     7.3.4  ionic-weather
@angular/cli                          7.2.3     7.2.4     7.3.4  ionic-weather
@angular/common                       7.2.2     7.2.7     7.2.7  ionic-weather
@angular/compiler                     7.2.2     7.2.7     7.2.7  ionic-weather
@angular/compiler-cli                 7.2.2     7.2.7     7.2.7  ionic-weather
@angular/core                         7.2.2     7.2.7     7.2.7  ionic-weather
@angular/forms                        7.2.2     7.2.7     7.2.7  ionic-weather
@angular/http                         7.2.2     7.2.7     7.2.7  ionic-weather
@angular/language-service             7.2.2     7.2.7     7.2.7  ionic-weather
@angular/platform-browser             7.2.2     7.2.7     7.2.7  ionic-weather
@angular/platform-browser-dynamic     7.2.2     7.2.7     7.2.7  ionic-weather
@angular/router                       7.2.2     7.2.7     7.2.7  ionic-weather
@ionic-native/core                    5.0.0     5.2.0     5.2.0  ionic-weather
@ionic-native/splash-screen           5.0.0     5.2.0     5.2.0  ionic-weather
@ionic-native/status-bar              5.0.0     5.2.0     5.2.0  ionic-weather
@ionic/angular                        4.0.0     4.0.2     4.0.2  ionic-weather
@ionic/angular-toolkit                1.2.3     1.2.3     1.4.0  ionic-weather
@types/jasmine                        3.3.8     3.3.9     3.3.9  ionic-weather
@types/node                        10.12.18  10.12.29   11.10.4  ionic-weather
core-js                               2.6.3     2.6.5     2.6.5  ionic-weather
karma                                 4.0.0     4.0.1     4.0.1  ionic-weather
karma-coverage-istanbul-reporter      2.0.4     2.0.5     2.0.5  ionic-weather
rxjs                                  6.3.3     6.3.3     6.4.0  ionic-weather
tslint                               5.12.1    5.12.1    5.13.1  ionic-weather
typescript                            3.2.4     3.2.4  3.3.3333  ionic-weather
```

The three most important columns here are `Current`, `Wanted`, and `Latest`.

- `Current` is the version that is currently installed
- `Wanted` is the version that can be upgraded to accordion to the rules specified in your `package.json`. This is the version that `npm update` will install.
-  `Latest` is the latest version available

For example have a look at the versions specified above for `@angular/cli`. An `npm update` will take the version from `7.2.3` to `7.2.4` but the latet version is `7.3.4`. The `7.3.4` version would need to be installed manually becaue the version is specified as `"@angular/cli": "~7.2.3"` in the `package.json` file. That is, the upgrade rule of `~` will take patch-level (bug-fix) changes but not minor version (new feature) versions.

Some analysis and thouht is required at this point. It is generally best to do the following with your own apps:

1. Create a branch so it is easy to revert if things to wrong
1. Upgrade according to the rules defined in your `package.json` (that is: `npm update`)
1. Test
1. Commit and continue if successful
1. `npm oudated`
1. Individually analyze the other changes
1. Install and test one package (or set of packages) at a time
1. Commit after each successful install so you always have a fall-back point

Let's walk through this process together in class.

## Conclusion

In this lab you learned how to include a third party library in your application, how to configure web component libraries that have been built using Stencil, and how to manage your dependencies. Next we will look at mocking up the user interface.

Be sure to commit your changes.
