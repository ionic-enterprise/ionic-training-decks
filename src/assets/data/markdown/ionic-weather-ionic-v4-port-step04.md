# Lab: Copy the Components

The general process is similar to the process for services.

1. generate the component
1. copy and fix the imports
1. copy and fix the code
1. copy and fix the HTML

We have a <a href="https://github.com/ionic-team/v4-migration-tslint" target="_blank">lint tool</a> that will help with some of this, especially the HTML portion.

Follow the instructions to install it. When you want to run it: `npx tslint -c ionic-migration.json -p tsconfig.json`

Also remember that the <a href="https://ionicframework.com/docs/" target="_blank">Ionic v4 Docs</a> are an excellent source of information.

## Generate the Component

1. `ionic g component user-preferences`
1. the component was added to the `declarations` section in the `AppModule` but since it is never navigated to it also need to be in the `entryComponents` so add it there
1. this component is part of the `AppModule` and it uses form inputs, so the `FormsModule` needs to be specified in `AppModule`'s imports

## Copy and Fix the Imports

1. copy all but the `@angular/core` imports from the v3 code
1. fix the broken paths
1. rename the "Provider" to be the service
1. that leaves a red squiggle under `ViewController`, which is no longer a thing, use `ModalController` instead

## Copy and Fix the Code

1. copy the properties and constructor from the v3 code, fix the types on the injected items in the constructor
1. the `ionViewDidLoad()` code needs to go in `ngOnInit()`, which needs to be `async`
1. the `save()` and `dismiss()` methods should copy without modification


## Copy and Fix the HTML

1. copy the v3 HTML for this component
1. run the linting tool (`npx tslint -c ionic-migration.json -p tsconfig.json`) and look for errors

You should see the following errors for this component:

```
ERROR: /users/kensodemann/projects/training/ionic-weather-v4/src/app/user-preferences/user-preferences.component.html[2, 3]: The ion-navbar component is now named ion-toolbar.
ERROR: /users/kensodemann/projects/training/ionic-weather-v4/src/app/user-preferences/user-preferences.component.html[5, 17]: The end attribute of ion-buttons has been renamed. Use slot="primary" instead.
ERROR: /users/kensodemann/projects/training/ionic-weather-v4/src/app/user-preferences/user-preferences.component.html[6, 14]: ion-button is now an ion-button element instead of an Angular directive.
ERROR: /users/kensodemann/projects/training/ionic-weather-v4/src/app/user-preferences/user-preferences.component.html[23, 9]: The ion-option component is now named ion-select-option.
ERROR: /users/kensodemann/projects/training/ionic-weather-v4/src/app/user-preferences/user-preferences.component.html[30, 10]: ion-button is now an ion-button element instead of an Angular directive.
```

Let's fix those and re-run the lint tool. Make fixes and re-run until there are no more errors for this component.

This is about as far as we can take this until we can see the results, which requires us to change the pages. So let's do that next.