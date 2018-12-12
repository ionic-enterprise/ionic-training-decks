# Lab: Layout the Pages

In this lab, you will learn:

* How the tabbed navigation is layed out
* How to change tab labels and icons
* How to use `git mv` to rename source files
* How to use VS Code's refactoring tools to rename classes

*Note:* The latter parts of this lab can be tedious an error prone. However, being able to refactor a project like we are doing here is a good skill to learn. Classes sometimes need to be renamed because of a poor choice during initial development or a change in direction after development starts. Being able to move code around in an organized fashion without breaking things is important.

## The Tabbed Navigation Layout

Two main files work in conjunction to define the navigation: 'tabs.router.module.ts` and `tabs.page.html`. Have a look at these two files to get an understanding of how the routes are defined. We will be changing these to make more sense for our app.

## Change Tab Labels and Icons

In `tabs.page.html`, change the `ion-label` values for the tabs such that the following tabs exist:

* Current Weather
* Forecast
* UV Index

Similarily, change the `ion-icon` components to use the following icons:

* cloud
* calendar
* sunny

Commit your changes here as the next two steps can be error prone and it is good to have a fallback.

## Refactor the Class Names

The tab names make sense for our application, but the classes associated with the specific pages are very generic like `Tab1Page`. Long term this will be a maintenance issue for future developers. Let's use VS Code's refactoring tools to help us change the class names for these pages.

* In `src/app/tab1/tab1.page.ts`, select `Tab1Page`, right click, and choose `Rename Symbol`. Rename the page to `CurrentWeatherPage`. This will change all references for us.
* In `src/app/tab1/tab1.module.ts`, select `Tab1PageModule`, right click, and choose `Rename Symbol`. Rename the page to `CurrentWeatherPageModule`. This will change all references for us.
* Open `src/app/tabs/tabs.router.module.ts` and notice that the `loadChildren` still references the old module class name. VS Code did not update that reference because it is a string and not an actual reference. You will have to update that one yourself

At this point, if you save all files your project should rebuild and will still work. Make similar changes to rename the classes for tabs 2 and 3.

Commit your changes when you are done. (I suggest committing after each page move)

## Rename the Source Files

The class names make sense now, but the files and folders are still a little off. It is usually advisable to use `git mv` to rename files as it makes sure that the history of the file is preserved. However in this case it is easiest to rename the files using VS Code. This will automatically update any references to the file with two exceptions:

* the `loadChildren` specified in `src/app/tabs/tabs.router.module.ts`
* the URLs that are specified in the `@component` dectorator in the component's TypeScript file

The items that are not changed automatically will need to be changed manually. When changing the `templateUrl` and `styleUrls`, the `selector` can be changed as well.

Using VS Code, change the path and file name as follows:

   * tab1 -> current-weather
   * tab2 -> forecast
   * tab3 -> uv-index

## Rename the Paths

The final bit that looks odd are the paths. We should change these for at least the following two reasons:

* navigation within the app code will make more sense and be self-documenting
* the path will look better in the case where we serve this as a PWA and someone running the app on their desktop will see a more friendly path

Changing the path at this point invovles changes in two files: `tabs.router.module.ts` and `tabs.page.html`

### `tabs.router.module.ts`

The `path` used by each tab should be changed from the generic `tabX` to something more meaningful such as `current-weather`. Here is what it currently looks like:

```TypeScript
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: '../current-weather/current-weather.module#CurrentWeatherPageModule'
          }
        ]
```

There are also some `redirectTo` values in that same file that need to be updated. Be sure to change those.

### `tabs.page.html`

The `tab` property of the `ion-tab-button` needs to match the correct path. Here is what one of them currently looks like. Change them to match the pats that were updated in `tabs.router.module.ts`

```HTML
    <ion-tab-button tab="tab1">
      <ion-icon name="cloud"></ion-icon>
      <ion-label>Current Weather</ion-label>
    </ion-tab-button>
```

## Conclusion

In this lab we learned how to refactor our code to make it more maintainable in the future.