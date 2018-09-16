# Lab: Styling and Theming

For the porpose of this discussion, styling has to do with the general layout of components in our app while theming has to do with the color scheme.

## Styling

For the most part, our styling can be taken directly from our v3 app with the exception that we will not bring over the colors.

1. copy all styling from `src/app/app.scss` and put it in `src/global.scss`
1. remove any color specifications from the copied styles
1. copy all page and component level styling, but do not wrap the style in the page/component tag

That is, this:

```scss
page-current-weather {
  .city {
    font-size: 24px;
    font-weight: bold;
  }

  .primary-value {
    margin-top: 18px;
  }

  kws-condition {
    --kws-condition-image-height: 212px;
    --kws-condition-label-font-size: 24px;
  }
}
```

Becomes this:

```scss
.city {
  font-size: 24px;
  font-weight: bold;
}

.primary-value {
  margin-top: 18px;
}

kws-condition {
  --kws-condition-image-height: 212px;
  --kws-condition-label-font-size: 24px;
}
```

That is because the pages and components are taking advantage of shadow DOM.

**user-preferneces.component**

The v3 styling looks kind of odd in the footer in v4. Let's not have any styling and just modify the markup so we wrap the `ion-button` in an `ion-toolbar` as such:

```HTML
<ion-footer>
  <ion-toolbar>
    <ion-button expand="block" color="secondary" (click)="save()">Save</ion-button>
  </ion-toolbar>
</ion-footer>
```

## Theming

Let's appy our color scheme.

1. the tabs should be the same color as the header, do this by setting the color to primary for the `ion-tabs`: `<ion-tabs color="primary">`
1. have a look at `theme/variables` and notice that there is a tertiary color in the theme, and it is orange, use this for the "save" button color: `<ion-button expand="block" color="tertiary" (click)="save()">Save</ion-button>`
1. in our v3 app, we redefined the primary color to be `#085a9e`, we can do the same here by changing the appropriate custom property: `--ion-color-primary: #085a9e;`
1. using Chrome's dev tools, we can see that to set the background color we can use this: `--ion-background-color: #b9dbf7;`
1. that last change effects the modal as well, so override that just for the modal by putting the following in the `user-preferences.component.scss` file

```scss
:host {
  --ion-background-color: #fff;
}
```

Your app should now look basically the same as the v3 app with some Ionic v4 improvements to the general MD and iOS look and feel.
