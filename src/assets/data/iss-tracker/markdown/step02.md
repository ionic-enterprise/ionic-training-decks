# Layout and Style

Our application looks a lot like what we want for the ISS tracker in that it has three tabs, but the UI is a little drab, the pages do not have the correct names, and the icons are wrong. Let's fix that.

## Overview

In this step, we will:

- Make a simple change to the style
- Update the icons used for the tabs
- Rename the tabs
- Rename the pages in code

## Details

### Changing Style

The style of your application can be adjusted in a few ways:

- adjust the basic style parameters in `src/theme/variables.scss`
- adjust the global styling via `src/app/app.scss`
- adjust the local styling via an individual page or component's `scss` file

For this lab, we will use a slightly nicer color for the header. Do do this, update the `src/theme/variables.sccs` file as such:

```sass
$colors: (
  header:     #6a1b9a,   // add this line
  primary:    #488aff,
  secondary:  #32db64,
  danger:     #f53d3d,
  light:      #f4f4f4,
  dark:       #222
);

$toolbar-background: color($colors, header);   // and this line
```

### Updating the Icons and Renaming the Tabs

The starter application contains three fairly generic pages. Our application uses none of these. To make our tab names and icons more applicable to the function of our application:

1. open the `src/pages/tabs/tabs.html` file
1. update the `tabTitle` and `tabIcon` properties on each tab as follows:

```html
<ion-tabs>
  <ion-tab [root]="tab1Root" tabTitle="Maps" tabIcon="locate"></ion-tab>
  <ion-tab [root]="tab2Root" tabTitle="Passes" tabIcon="list"></ion-tab>
  <ion-tab [root]="tab3Root" tabTitle="Astronauts" tabIcon="people"></ion-tab>
</ion-tabs>
```

## Renaming the Pages in the Code

At this point, there is a disconnect between the name of our pages in the code and the function that is targetted for each page. Let's fix that. This is basically a brute force operation.

For the items being renamed, be sure to rename all files within the folder and modify any class names, etc. to make sense.

- `src/pages/about` -> `src/pages/passes`
- `src/pages/contacts` -> `src/pages/astronauts`
- `src/pages/home` -> `src/pages/map`
- `src/pages/tab/tabs.ts` - change references
- `src/app/app.module.ts` - change references
