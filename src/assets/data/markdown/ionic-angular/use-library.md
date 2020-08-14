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
    "kws-weather-widgets": "~2.0.3",
```

## Use the Library

Good libraries usually document exactly how to use the library in your application. In the case of this library - which is a web component library built using a technology called <a href="https://stenciljs.com" target="_blank">Stencil</a> - there are a couple of steps that need to be taken to use the library in an Angular project (like yours).

First, there is a method in the library called `defineCustomElements()` that needs to be called. This is usually called in the `main.ts` file. This method contains the special sauce that bundlers like WebPack need in order to be aware of the components, with the end result being that WebPack will bundle them properly.

```TypeScript
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { defineCustomElements } from 'kws-weather-widgets/loader';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
defineCustomElements();
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
$ npm outdated
Package                            Current    Wanted   Latest  Location
@types/node                       12.12.47  12.12.47  14.0.13  ionic-weather
jasmine-spec-reporter                4.2.1     4.2.1    5.0.2  ionic-weather
karma                                5.0.9     5.0.9    5.1.0  ionic-weather
karma-coverage-istanbul-reporter     2.1.1     2.1.1    3.0.3  ionic-weather
karma-jasmine                        3.0.3     3.0.3    3.3.1  ionic-weather
protractor                           5.4.4     5.4.4    7.0.0  ionic-weather
ts-node                              8.3.0     8.3.0   8.10.2  ionic-weather
tslib                               1.13.0    1.13.0    2.0.0  ionic-weather
typescript                           3.8.3     3.8.3    3.9.5  ionic-weather
```

The three most important columns here are `Current`, `Wanted`, and `Latest`.

- `Current` is the version that is currently installed
- `Wanted` is the version that can be upgraded to accordion to the rules specified in your `package.json`. This is the version that `npm update` will install.
-  `Latest` is the latest version available

Some analysis and thouht is required at this point. It is generally best to do the following with your own apps:

1. Create a branch so it is easy to revert if things to wrong
1. Upgrade according to the rules defined in your `package.json` (that is: `npm update`)
1. Test
1. Commit and continue if successful
1. `npm oudated`
1. Individually analyze the other changes
1. Install and test one package (or set of packages) at a time
1. Commit after each successful install so you always have a fall-back point

**Note:** if you are lucky enough to need a major Angular upgrade, the Angular team has a <a href="https://update.angular.io/" target = "_blank">really cool tool</a> to help with that. 

Let's walk through this process together in class.

## Conclusion

In this lab you learned how to include a third party library in your application, how to configure web component libraries that have been built using Stencil, and how to manage your dependencies. Next we will look at mocking up the user interface.

Be sure to commit your changes.
