# Lab: Style the Application

In this lab, you will further explore how to style your application.

## A Note on iOS and Material Design Styling

The Ionic Framework automatically adapts between styling that matches the iOS Human Interface Guidelines and Android's Material Design. We _highly_ suggest that you keep this paradigm in place. It allows your customers to see the application in a manner that makes sense to them on whatever platform they are on. The best practice here is to style your application in a way that injects your own branding without interfering with the native styling that makes the application look "at home" on each platform.

## Styling

Our design team has come back to use with some requirements about how the application should look. Luckily these are fairly light weight suggestions for now, but we are going to want to start thinking about how we want to accomplish what the design team requires.

### Scoped CSS vs. Global CSS

Generally, we want as much of our styling to be as global as possible in order to give our application an overall consistent look and feel. However, it is sometimes desirable to only apply a particular style within a specific view or component.

Have a look at the `src/app/shared/rating/rating.component.scss` file. There you will find the following styles:

```css
ion-icon {
  font-size: 24px;
  padding-right: 12px;
  color: gold;
}

ion-icon:last-child {
  padding-right: 0px;
}
```

Since these are defined in an Angular component, and since we are building using Angular's default scoping rules, these styles will be scoped to the component itself. Without this kind of mechanism in place, these styles would actually apply to all `ion-icon`s in the application unless a more specific selector were used.

Now have a look in `src/global.scss`. Currently, it contains several imports as well as the following styling:

```css
.error-message {
  padding: 2em;
  color: var(--ion-color-danger, ##ff0000);
}
```

But _should_ we actually put our global styling directly here? It is convenient when we just have a few styles. A real-world application, however, is likely to have a fair amount of styling. In such cases, we should create a set of SCSS files and import them here.

For our app, though, we will just put the global styles directly into this file. We will not have enough styling yet to justify seperate files.

### Shadow DOM

Most of the components in the Ionic Framework use <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM" target="_blank">Shadow DOM</a>. This works very similar to the `scoped` discussion above, allowing the framework developers to apply styling to the individual components without having that styling bleed out into other components. This also allows you as a developer to use the component without having to worry about the details of the component's construction when styling your own application.

However, it also means that different techniques must be employed when styling these components. The authors of the components must provide you with a styling API that defines the ways in which they intend for you to be able to style these components. The two mechanisms that make this possible are `CSS Custom Properties` (also called `CSS Variables`) and `Shadow Parts`.

### Light DOM

There really is no official term called "Light DOM" but it is a term that is common referred to items outside of a shadow root that you can style via traditional means. Even for many components that use shadow DOM you are still able to apply "light DOM" styling to them. For example:

```css
ion-card {
  border-radius: 20px;
}
```

The `ion-card` uses shadow DOM, but that is for the internal structure. The border radius applies to the card itself, which is visible in the normal DOM tree, and thus can be styled via traditional means.

### CSS Custom Properties

The Ionic Framework makes heavy use of CSS Custom Properties. They are used to define the color scheme, default padding, etc. They are also used heavily in order to style individual components. Have a look at the <a href="https://ionicframework.com/docs/api/button#css-custom-properties">CSS Custom Properties for a button</a> as an example. This defines an API for the ways in which the framework authors intend for you to be able to style a button. You can do so as such:

```css
ion-button {
  --opacity: 0.75;
}
```

This will apply a 75% opacity to all buttons in the application. You probably want to be a bit more restrictive with your selector, but that is the basic idea with the custom properties.

### Shadow Parts

A newer specification is <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">Shadow Parts</a>. This allows the component author to tag specific parts of the component as something you can apply styles to as if it were in the light DOM. This allows component developers to still restrict how a component can be styled without having to redefine all of the ways an underlying element can be styled via a CSS Custom Property.

As a result, users of the component can still style the component in ways that they are used do styling things, while still being protected from the implementation details of how the component itself is rendered internally.

Have a look at the <a href="https://ionicframework.com/docs/api/select#css-shadow-parts">Shadow Parts of a Select</a>. Notice that the various parts of a select are abstracted into parts that you can access and style, but you do not have to worry about the details of exactly how the component itself was constructed.

This allows you to style the icon, for example, as such:

```css
ion-select::part(icon) {
  width: 20px;
  border: 1px solid;
  border-radius: 4px;
}
```

## Putting it All Together

The design team has started giving us design requirements. Mostly the color schemes to use for both light and dark mode, but they would also like a minor tweak to the border radius on the cards and a slightly different style on the select dropdown.

### The Color Theme

Our design team has decided on the following colors.

Light Mode Theme:

- Primary: `#ac9d83`
- Secondary: `#f1ebe1`
- Tertiary: `#ccc2b1`

Dark Mode Theme:

- Primary: `#ac9d83`
- Secondary: `#5f5037`
- Tertiary: `#8a7a5f`

#### Defining Colors

The color scheme for the application is defined in `src/theme/variables.css` via a set of CSS Custom Properties. Each color within the system has 6 settings. For example:

```css
--ion-color-primary: #ac9d83;
--ion-color-primary-rgb: 172, 157, 131;
--ion-color-primary-contrast: #000000;
--ion-color-primary-contrast-rgb: 0, 0, 0;
--ion-color-primary-shade: #978a73;
--ion-color-primary-tint: #b4a78f;
```

Given the base color (`#ac9d83` in this case), you can use our <a href="https://ionicframework.com/docs/theming/color-generator" target="_blank">Color Generator</a> tool to generate a set of values for each color. Do this for the Light Mode theme colors and update `src/theme/variables.css`.

#### Handling Dark Mode

The framework can automatically adjust for dark mode on browsers that support it. Scroll down to the line that has `@media (prefers-color-scheme: dark)` in it. The properties that are defined within there are for dark mode.

Notice that it has the same set of colors defined there, only with different values for use in dark mode. Use the <a href="https://ionicframework.com/docs/theming/color-generator" target="_blank">Color Generator</a> and the Dark Mode theme colors above to determine the values that we should use here, and then update the file.

There is also a set of other colors for both iOS and Material Design. For these, our designers also provided us with some values, some of which were generated via a color gradient tool. Here are the values to use there:

```css
.ios body {
  --ion-background-color: #110b00;
  --ion-background-color-rgb: 17, 11, 0;

  --ion-text-color: #ffffff;
  --ion-text-color-rgb: 255, 255, 255;

  --ion-color-step-50: #1b1710;
  --ion-color-step-100: #24211a;
  --ion-color-step-150: #2e2a24;
  --ion-color-step-200: #39352e;
  --ion-color-step-250: #433f38;
  --ion-color-step-300: #434a43;
  --ion-color-step-350: #5a554d;
  --ion-color-step-400: #656059;
  --ion-color-step-450: #716c64;
  --ion-color-step-500: #737870;
  --ion-color-step-550: #89847c;
  --ion-color-step-600: #969088;
  --ion-color-step-650: #a29d94;
  --ion-color-step-700: #afa9a0;
  --ion-color-step-750: #bcb6ad;
  --ion-color-step-800: #c9c3ba;
  --ion-color-step-850: #d6d0c7;
  --ion-color-step-900: #e3ded4;
  --ion-color-step-950: #f1ebe1;

  --ion-toolbar-background: #1b1710;

  --ion-item-background: #110b00;

  --ion-card-background: #24211a;
}
```

```css
.md body {
  --ion-background-color: #110b00;
  --ion-background-color-rgb: 17, 11, 0;

  --ion-text-color: #ffffff;
  --ion-text-color-rgb: 255, 255, 255;

  --ion-border-color: #24211a;

  --ion-color-step-50: #1b1710;
  --ion-color-step-100: #24211a;
  --ion-color-step-150: #2e2a24;
  --ion-color-step-200: #39352e;
  --ion-color-step-250: #433f38;
  --ion-color-step-300: #434a43;
  --ion-color-step-350: #5a554d;
  --ion-color-step-400: #656059;
  --ion-color-step-450: #716c64;
  --ion-color-step-500: #737870;
  --ion-color-step-550: #89847c;
  --ion-color-step-600: #969088;
  --ion-color-step-650: #a29d94;
  --ion-color-step-700: #afa9a0;
  --ion-color-step-750: #bcb6ad;
  --ion-color-step-800: #c9c3ba;
  --ion-color-step-850: #d6d0c7;
  --ion-color-step-900: #e3ded4;
  --ion-color-step-950: #f1ebe1;

  --ion-toolbar-background: #1b1710;

  --ion-tab-bar-background: #1b1710;

  --ion-item-background: #110b00;

  --ion-card-background: #24211a;
}
```

#### Applying the Colors

The first requirement from our design team is that the pages should have a gradient background, going from from white to `--ion-color-secondary` for the light theme, or `--ion-background-color` to `--ion-color-secondary` for dark theme. We will do this via a class. Unless otherwise noted, all of the following styles will go in the `src/global.scss` file.

```css
.main-content {
  --background: linear-gradient(white, var(--ion-color-secondary));
}

@media (prefers-color-scheme: dark) {
  .main-content {
    --background: linear-gradient(
      var(--ion-background-color),
      var(--ion-color-secondary)
    );
  }
}
```

Then add the `main-content` class to the `ion-content` elements in each of our pages. So far so good, but the lists in a couple of our pages show the default background color, which looks a little out of place, so let's make the background for the various list elements transparent.

```css
.list-ios {
  background: transparent;
}

.list-md {
  background: transparent;
}

.item {
  --background: transparent;
}

ion-list-header {
  --background: transparent;
}
```

Nice!

We have a couple of other components where we need to set a specific color. Namely the tabs as well as the footer area on the login page. To modify the color of spcific components, we can set the color attribute as such: `color="primary"`. Let's use this to set our colors:

**`src/app/login/login.page.html`**

```html
    <ion-footer>
      <ion-toolbar color="secondary">
        <ion-button
```

**`src/app/tabs/tabs.page.html`**

```html
<ion-tabs>
  <ion-tab-bar color="tertiary" slot="bottom">
    <ion-tab-button tab="teas" href="/tabs/teas"></ion-tab-button></ion-tab-bar
></ion-tabs>
```

### Other Styles

First, our design team wants a slightly more obvious radius on our cards. Since this is in the light DOM we can use traditional styling techniques to accomplish this.

```css
ion-card {
  border-radius: 20px;
}
```

They would also like the select component to have a nice box around the down-arrow shape. This is in the shadow DOM so we need to use a different technique. In this case, we can use Shadow Parts to modify the select.

```css
ion-select::part(icon) {
  width: 20px;
  border: 1px solid;
  border-radius: 4px;
}
```

This results in the text being a little too close to the button icon, crowding it a bit, so we will use the shadow part for the text to nudge that over.

```css
ion-select::part(text) {
  margin-right: 1em;
}
```

## Conclusion

We have now applied styling across our application. Test it out in both light and dark mode.
