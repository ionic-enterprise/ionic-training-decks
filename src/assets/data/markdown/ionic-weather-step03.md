# Lab: Monitor for Errors

**Note:** In this lab, we will again make changes directly in `master`. This is OK only because we are all working in with our own repositories and are not a shared remote. I will stress once again not to do this in real life.

In this lab you will:

* Change the "about" page to have a big red button that throws an exception
* Upload source maps to Ionic Pro to provide better output in <a href="https://ionicframework.com/docs/pro/monitoring/" target="_blank">Monitoring</a>
* Deploy the updated application to your device 

## `about.ts`

Change the `about.ts` file as follows:

```TypeScript
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  message: string;

  constructor(public navCtrl: NavController) {}

  tossIt() {
    this.message = 'you had best go check your logs...';
    throw new Error('Seriously? Who sees a big red button and then pushes it?');
  }
}
```

What you did here was:

1. Created a method that throws an error
1. Added a property to store a message that will be displayed on the page

## `about.html`

Change the `about.html` file as follows:

```html
<ion-header>
  <ion-navbar>
    <ion-title>
      About
    </ion-title>
  </ion-navbar>
</ion-header>

<ion-content padding>
  <div>
    <button ion-button color="danger" (click)="tossIt()">Big Red Button</button>
  </div>
  <div>
    {{message}}
  </div>
</ion-content>
```

This creates a big red button, and everyone knows that you should not press big red buttons, but everyone does it anyhow.

## Source Maps

Source maps are required in order to provide a reasonable output of where the error is occuring. To upload source maps, run the following commands:

1. `ionic build`
1. `ionic monitoring syncmaps`

## Commit and Run

Now commit these changes and deploy to Ionic Pro. Once the build has completed and is the active build on the Master channel, reopen the application on your device and trigger the error by pressing the big red button. After some processing time it will appear on the Ionic Pro dashboard.

1. `git commit -am "feat(ionic-pro): throw an error on purpose"`
1. `git push`
1. `git push ionic master`