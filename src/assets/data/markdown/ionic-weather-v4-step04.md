# Lab: Use a Library

In this lab, you will learn how to:

* Install third party libraries
* Integrate the third party libraries into your application
* Manage the application's dependencies

## Install the Library

It is often useful to use third party libraries. For this application, we will use a library of <a href="https://github.com/kensodemann/kws-weather-widgets" target="_blank">weather related components</a> that I created and published on NPM. Many useful JavaScript libraries are availble via NPM and are available for use in your application.

To install my weather component library, run: `npm install kws-weather-widgets`

The library is installed in `node_modules` and your `package.json` file is updated to reflect the new dependency:

```JSON
    "kws-weather-widgets": "1.0.0",
```

## Use the Library

Good libraries usually document exactly how to use the library in your application. In the case of this library - which is a web component library built using a technology called <a href="https://stenciljs.com" target="_blank">Stencil</a> - there are a couple of steps that need to be taken to use the library in an Angular project (like yours).

First, there is a method in the library called `defineCustomElements()` that needs to be run. This is usually run in the `main.ts` file. This method contains the special sauce that bundlers like WebPack need in order to be aware of the components, with the end result being that WebPack will bundle them properly.

```TypeScript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from 'kws-weather-widgets/dist/loader';

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

## Managing Dependencies

NPM is also used to manage the application's dependencies. If you type `npm outdated` from the root directory of your project you can see which dependencies may need upgrading.

As of the time of this writing, here are the results:

```
~/Projects/Training/ionic-weather (master *): npm outdated
Package                            Current         Wanted  Latest  Location
@ionic/angular-toolkit     1.2.3     1.2.3     1.3.0  ionic-weather
@types/node             10.12.18  10.12.19  10.12.19  ionic-weather
```

Some analysis and thouht it required at this point. Having done this exercise before, here is what I can tell you:

* The `@types/node` upgrade can be taken safely via `npm upgrade`
* The `@ionic/angular-toolkit` can be taken safely via `npm i @ionic/angular-toolkit@latest`

## Conclusion

In this lab you learned how to include a third party library in your application, how to configure web component libraries that have been built using Stencil, and how to manage your dependencies. Next we will look at mocking up the user interface.

Be sure to commit your changes.
