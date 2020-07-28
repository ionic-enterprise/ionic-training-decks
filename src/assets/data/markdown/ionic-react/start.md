# Lab: Generate the Application

In this lab, you will:

- Start a new Ionic React application
- Add some code formatting tooling
- Restructure the starter for our base application
- Build and run the starter application

## Start Here

The Ionic CLI includes a command called `start` that we can use to bootstrap an application. The `start` command will use a basic starter application as its starting point. It is best to begin with the starter that most closely resembles the type of application we would like to create. In our case, we want a basic tabs based application, so we will use the `tabs` starter.

```bash
$ ionic start ionic-weather tabs --type=react --capacitor
$ cd ionic-weather
$ npm start
```

## Enforce Consistent Styling

<a href="https://prettier.io/" target="_blank">Prettier</a> is an excellent tool that you can use to keep the formatting of your code consistent and clean. We highly suggest you use a tool such as this. Whether your are a lone developer or part of a team, using a tool such as Prettier means that you do not have to think about the formatting of your code. Better yet, you do not run into "formatting wars" between developers.

Prettier itself is an opinionated code formatter, and Ionic has its own opinions on how it is best configured, so let's install a package that provides both Prettier and Ionic's configuration. We will also install <a href="https://www.npmjs.com/package/husky" target="_blank">husky</a> and <a href="https://www.npmjs.com/package/pretty-quick" target="_blank">pretty-quick</a>. This will allow us to set up a commit hook to make sure Prettier is run with each commit. After that we don't have to waste brain cycles thinking about code formatting ever again.

```bash
$ npm install -D @ionic/prettier-config husky prettier pretty-quick
```

Modify your `package.json` file. I suggest moving the `description` up to the top and giving it a reasonable value, and then adding the Prettier config portion to the bottom. For example:

```json
{
  "name": "ionic-weather",
  "description": "A personal weather application",
  "version": "0.0.1",
  "author": "Ionic Framework",
  "homepage": "https://ionicframework.com/",
  "scripts": {
    ...
  },
  "private": true,
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
  },
  "prettier": "@ionic/prettier-config",
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  }
}
```

Finally, make sure all of our source is formatted properly.

```bash
$ npx prettier --write src
```

At this point all of the source should be formatting properly and will remain so automatically with each commit.

##  Redo the Routes

Navigate around the current app. Notice that the routes are not very descriptive within the context of our application. This won't matter at all for a hybrid native app, but if we are going to do anything like deploy this as a PWA or implement deep linking at some point, it would be better to have meaningful route names. We will make the following changes:

- `tab1` => `current-weather`
- `tab2` => `forecast`
- `tab3` => `uv-index`

All of these changes are in the `src/App.tsx` file. Open it up and give it a shot. Here is what needs to be changed for `tab1` but I leave it to you to figure out the other two.

```diff
@@ -7,7 +7,7 @@ import {
   IonRouterOutlet,
   IonTabBar,
   IonTabButton,
-  IonTabs
+  IonTabs,
 } from '@ionic/react';
 import { IonReactRouter } from '@ionic/react-router';
 import { ellipse, square, triangle } from 'ionicons/icons';
@@ -39,13 +39,13 @@ const App: React.FC = () => (
     <IonReactRouter>
       <IonTabs>
         <IonRouterOutlet>
-          <Route path="/tab1" component={Tab1} exact={true} />
+          <Route path="/current-weather" component={Tab1} exact={true} />
           <Route path="/tab2" component={Tab2} exact={true} />
           <Route path="/tab3" component={Tab3} />
-          <Route path="/" render={() => <Redirect to="/tab1" />} exact={true} />
+          <Route path="/" render={() => <Redirect to="/current-weather" />} exact={true} />
         </IonRouterOutlet>
         <IonTabBar slot="bottom">
-          <IonTabButton tab="tab1" href="/tab1">
+          <IonTabButton tab="current-weather" href="/current-weather">
             <IonIcon icon={triangle} />
             <IonLabel>Tab 1</IonLabel>
           </IonTabButton>
```

## Rename the Page Components

The page components still have really bad names (`Tab1`, `Tab2`, `Tab3`). These should be changed as such:

- `Tab1` => `CurrentWeather`
- `Tab2` => `Forecast`
- `Tab3` => `UVIndex`

Here are the steps required:

1. Rename the files under `src/pages`
1. Change the component names used in each of the `src/pages/*.tsx` files
1. In the same files, change the CSS file imports based on the file renames
1. Change the imports and component names used in the `src/App.tsx` file

## Side Note: `ionic serve` vs. `npm start`

You may be used to using `npm start` to start an application. That works, but it is different. The application is for all intents and purposes a React application and was generated using the Create React App starter with some extra Ionic spices, so all of the base Create React App configuration is there.

In a nutshell:

- `npm start` uses the React Scripts CLI directly calling `react-scripts start` without any options, which tries to use port 3000 by default, though if port 3000 is used it will ask to use a different port
- `ionic serve` finds the first unused port >= 8100 and sets that as the PORT before calling `react-scripts start`

In either case, react-scripts does all the heavy lifting, so use whichever command you want to use. Personally, I use `npm start` because it take less typing and thought on my part.

## Conclusion

Congratulations on creating your `@ionic/react` application. Be sure to commit all of your changes. Next we will explore unit tests and discuss how they can help us in our development lifecycle.
