# Lab: Interact with the Service Worker

In this lab, we will learn out to interact with the service worker to let the user know when an update is available and offer to restart the application for them so they can load the new version.

## Overview

The service workers main job is to cache the application and its resources. When the service worker does this, it does so as a single unit and stores them as a snapshot. When the application is updated, those updates will also be downloaded as a unit and the new snapshot will only be applied when: the update is completely downloaded and cached, and the application is restarted. In this way, the service worker ensures application consistency while the application is running.

You can just sighlently download updates and then apply them when the user next restarts the application, or you can detect when the service worker has a new snapshot available and ask the user if they would like to restart the application to get the new version. In this lab, we will modify our application to do the latter.

## Add the Application Service

The `ApplicationService` will subscribe to the `SwUpdate` service's `update` observable. When an update is available, it will prompt the user about the update and ask them if they would like to restart.

First, create the service:

```bash
$ ionic g s core/application/application
```

### Test

The test for this service is straight forward. We won't verify that the page acutally reloads, but we will verify that the user is asked if they would like to reload the application.

```typescript
import { TestBed } from '@angular/core/testing';
import { AlertController } from '@ionic/angular';
import { SwUpdate } from '@angular/service-worker';

import { ApplicationService } from './application.service';
import { Subject } from 'rxjs';
import {
  createOverlayControllerMock,
  createOverlayElementMock,
} from '@test/mocks';

describe('ApplicationService', () => {
  let alert: HTMLIonAlertElement;
  beforeEach(() => {
    alert = createOverlayElementMock('Alert');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useFactory: () => ({
            available: new Subject(),
          }),
        },
        {
          provide: AlertController,
          useFactory: () =>
            createOverlayControllerMock('AlertController', alert),
        },
      ],
    });
  });

  it('should be created', () => {
    const service: ApplicationService = TestBed.inject(ApplicationService);
    expect(service).toBeTruthy();
  });

  describe('registered for updates', () => {
    beforeEach(() => {
      (alert.onDidDismiss as any).and.returnValue(
        Promise.resolve({ role: 'cancel' }),
      );
      const service: ApplicationService = TestBed.inject(ApplicationService);
      service.registerForUpdates();
    });

    it('asks the user if they would like an update', () => {
      const update = TestBed.inject(SwUpdate);
      const alertController = TestBed.inject(AlertController);
      expect(alertController.create).not.toHaveBeenCalled();
      (update.available as any).next();
      expect(alertController.create).toHaveBeenCalledTimes(1);
      expect(alertController.create).toHaveBeenCalled();
    });
  });
});
```

### Code

The code itself is also straight forward.

```typescript
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(
    private alertController: AlertController,
    private update: SwUpdate,
  ) {}

  registerForUpdates() {
    this.update.available.subscribe(() => this.promptUser());
  }

  private async promptUser() {
    const alert = await this.alertController.create({
      header: 'Update Available',
      message:
        'An update is available for this application. Would you like to restart this application to get the update?',
      buttons: [
        { text: 'Yes', role: 'confirm' },
        { text: 'No', role: 'cancel' },
      ],
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    if (result.role === 'confirm') {
      this.update.activateUpdate().then(() => document.location.reload());
    }
  }
}
```

Create a mock factory (filename: `application.service.mock.ts`) using one of the others service's mock factories as model if you need to. Make sure you update the `src/app/core/index.ts` and `src/app/core/testing.ts` files.

## Hook Up the Application Service

We will register for updates when the application is initialized in the `AppComponent`, but only if the application is not running in a hybrid mobile context.

### Test

The first thing we need to do in the test is provide the `ApplicationService` using our mock factory.

```typescript
        {
          provide: ApplicationService,
          useFactory: createAppliationServiceMock,
        },
```

Once that is in place, we need to have one test in the "hybrid mobile context" section showing that we _do not_ register for updates and another almost identical test in the "web context" section showing that we _do_ register for updates. Note the one line difference between the two tests.

```typescript
    describe('in a hybrid mobile context', () => {
      ...
      it('registers for updates', () => {
        const application = TestBed.inject(ApplicationService);
        TestBed.createComponent(AppComponent);
        expect(application.registerForUpdates).not.toHaveBeenCalled();
      });
    });

    describe('in a web context', () => {
      ...
      it('registers for updates', () => {
        const application = TestBed.inject(ApplicationService);
        TestBed.createComponent(AppComponent);
        expect(application.registerForUpdates).toHaveBeenCalledTimes(1);
      });
    });
```

### Code

In the `AppComponent`, inject the `ApplicationService` and call its `registerForUpdates()` method in the appropriate spot.

## Conclusion

You can do another production build and redeploy your application if you wish. You now have a fully functioning application that you can easily deploy as either a hybrid mobile application or a PWA.
