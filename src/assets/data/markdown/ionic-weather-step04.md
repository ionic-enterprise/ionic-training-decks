# Lab: Layout the Pages

Our application will have three tabs:

* Current Weather
* Forecast
* UV Index


1. prepare your development environment
1. change the tab labels
1. change the tab icons
1. change the page titles
1. rename the source code for the pages
1. finish the feature

## Prepare the Development Environment

When we start developing a feature, we should start our development server and create a branch to work in.

1. `npm start` OR `ionic serve`
1. `git checkout -b feature/layoutPages`

## Change the Tab Labels

Open the `src/pages/tabs/tabs.htl` file. It currently looks like this:

```html
<ion-tabs>
  <ion-tab [root]="tab1Root" tabTitle="Home" tabIcon="home"></ion-tab>
  <ion-tab [root]="tab2Root" tabTitle="About" tabIcon="information-circle"></ion-tab>
  <ion-tab [root]="tab3Root" tabTitle="Contact" tabIcon="contacts"></ion-tab>
</ion-tabs>
```

Change the `tabTitle` values so we have the following tabs:

* Current Weather
* Forecast
* UV Index

`git commit -am "feat(layout): rename the tabs"`


## Change the Tab Icons

That reads much more nicely, but picture does not really match the title. Let's fix that.

Change the `tabIcon` values in the `src/pages/tabs/tabs.htl` file as such:

* cloud
* calender
* sunny

`git commit -am "WIP - update the tab icons"`

## Change the Page Titles

The titles are still wrong. Let's fix that.

Open each of the following files and change the title:

* `src/pages/home/home.html` - Current Weather
* `src/pages/about/about.html` - Forecast 
* `src/pages/contact/contact.html` - UV Index 

`git commit -am "WIP - update the page titles"`

## Moving and Renaming Source

Visually, everything makes sense now in our application, but the page names do not match the general contents. Long term, that is going to be an issue. Let's fix that as well.

Rename the pages as such:

* home -> current-weather
* about -> forecast
* contact -> uv-index

It is easiest to do the move of the files from the command line. Here is a set of commands that you can run from your project's root directory in order to accomplish this.

(**Note:** This was not tested on a windows machine, but if you have a Windows machine and use the GitBash shell instead of the command promt, this should work)

```
cd src/pages
mkdir current-weather forecast uv-index
git mv home/home.ts current-weather/current-weather.ts
git mv home/home.scss current-weather/current-weather.scss
git mv home/home.html current-weather/current-weather.html
rmdir home
git mv about/about.ts forecast/forecast.ts
git mv about/about.scss forecast/forecast.scss
git mv about/about.html forecast/forecast.html
rmdir about
git mv contact/contact.ts uv-index/uv-index.ts
git mv contact/contact.scss uv-index/uv-index.scss
git mv contact/contact.html uv-index/uv-index.html
rmdir contact
cd ../..
```

**Pro Tip:** when refactoring code involves renaming modules, use `git mv`. This ensures that git tracks the change as a move and not something else like a delete and add.

While that was easy enough, the app is now totally broken. Let's fix that.

First, open the `src/app/app.module.ts` and `src/pages/tabs/tabs.ts` files and fix the paths as follows:

**tabs.ts**

```
import { AboutPage } from '../forecast/forecast';
import { ContactPage } from '../uv-index/uv-index';
import { HomePage } from '../current-weather/current-weather';
```

**app.module.ts**

```
import { AboutPage } from '../pages/forecast/forecast';
import { ContactPage } from '../pages/uv-index/uv-index';
import { HomePage } from '../pages/current-weather/current-weather';
```

By fixing these errors first, this allows use to use VSCode's refactoring tools to rename the classes. Open `src/pages/current-weather/current-weather.ts` and do the following:

* change the `selector` value to `page-current-weather`
* change the `templateUrl` value to `current-weather.html`
* use the VSCode "Rename Symbol" tool to rename `HomePage` to `CurrentWeatherPage` (right click to get a pop-up menu, or use the `F2` hotkey on a Mac (may need to also use `fn`))

When you are done, the code should look like this:

```TypeScript
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-current-weather',
  templateUrl: 'current-weather.html'
})
export class CurrentWeatherPage {
  constructor(public navCtrl: NavController) {}
}
```

Better yet, the references in `app.module.ts` and `tabs.ts` should have changed as well. Repeat these steps for the other two pages that were renamed. At this point, you should have a functioning application once again with properly refactored code.

`git commit -am "WIP - rename the page classes"`

## Finish the Feature

At this point, you should squash your commits and submit the branch for pull request.

For the purpose of this training exercise, we will squash our commits and merge into master.

1. `git fetch origin master`
1. `git rebase -i origin/master`
1. `git checkout master`
1. `git merge feature/layoutPages`
1. `git branch -d feature/layoutPages`
1. `git push`
1. `git push ionic master`

**Note:** If your dev server is now spitting out errors it is just that it picked up one of the above changes mid-way through. Just kill the dev server and restart it.

Once the build completes on Ionic Pro and is associated with the Master channel completely kill and restart the application on your device. At this point, you should see your modified application.