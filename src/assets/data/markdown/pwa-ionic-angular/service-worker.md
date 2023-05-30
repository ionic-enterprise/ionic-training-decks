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
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';
import { createOverlayControllerMock, createOverlayElementMock } from '@test/mocks';
import { Subject } from 'rxjs';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let alert: HTMLIonAlertElement;
  beforeEach(() => {
    alert = createOverlayElementMock('Alert');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useFactory: () => ({
            versionUpdates: new Subject(),
          }),
        },
        {
          provide: AlertController,
          useFactory: () => createOverlayControllerMock('AlertController', alert),
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
      (alert.onDidDismiss as any).and.returnValue(Promise.resolve({ role: 'cancel' }));
      const service: ApplicationService = TestBed.inject(ApplicationService);
      service.registerForUpdates();
    });

    it('asks the user if they would like an update on VERSION_READY', () => {
      const update = TestBed.inject(SwUpdate);
      const alertController = TestBed.inject(AlertController);
      expect(alertController.create).not.toHaveBeenCalled();
      (update.versionUpdates as any).next({ type: 'VERSION_READY' });
      expect(alertController.create).toHaveBeenCalledTimes(1);
      expect(alertController.create).toHaveBeenCalled();
    });

    it('does not ask the user on VERSION_INSTALLATION_FAILED', () => {
      const update = TestBed.inject(SwUpdate);
      const alertController = TestBed.inject(AlertController);
      expect(alertController.create).not.toHaveBeenCalled();
      (update.versionUpdates as any).next({ type: 'VERSION_INSTALLATION_FAILED' });
      expect(alertController.create).not.toHaveBeenCalled();
    });

    it('does not ask the user on VERSION_DETECTED', () => {
      const update = TestBed.inject(SwUpdate);
      const alertController = TestBed.inject(AlertController);
      expect(alertController.create).not.toHaveBeenCalled();
      (update.versionUpdates as any).next({ type: 'VERSION_DETECTED' });
      expect(alertController.create).not.toHaveBeenCalled();
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
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private alertController: AlertController, private update: SwUpdate) {}

  registerForUpdates() {
    this.update.versionUpdates.pipe(filter((evt) => evt.type === 'VERSION_READY')).subscribe(() => this.promptUser());
  }

  private async promptUser() {
    const alert = await this.alertController.create({
      header: 'Update Available',
      message:
        'An update is available for this application. Would you like to restart this application to get the update?     ',
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

The first thing we need to do in the test is provide the `ApplicationService` and `Platform` service using mock factories.

```diff
--- a/src/app/app.component.spec.ts
+++ b/src/app/app.component.spec.ts
@@ -1,15 +1,21 @@
 import { TestBed } from '@angular/core/testing';
 import { provideRouter } from '@angular/router';
 import { SplashScreen } from '@capacitor/splash-screen';
+import { Platform } from '@ionic/angular';
 import { AppComponent } from './app.component';
+import { ApplicationService } from './core';
+import { createApplicationServiceMock } from './core/testing';

 describe('AppComponent', () => {
   beforeEach(async () => {
     await TestBed.configureTestingModule({
       imports: [AppComponent],
       providers: [provideRouter([])],
-    }).compileComponents();
+    })
+      .overrideProvider(ApplicationService, { useFactory: createApplicationServiceMock })
+      .compileComponents();
   });

   it('should create the app', () => {
```

Once that is in place, add a couple of tests, one for a hybrid mobile context, the other for a web context. In the "hybrid mobile context" section show that we _do not_ register for updates. In the "web context" section show that we _do_ register for updates. Note the one line difference between the two tests.

```diff
@@ -18,4 +32,33 @@ describe('AppComponent', () => {
     const app = fixture.debugElement.componentInstance;
     expect(app).toBeTruthy();
   });
+
+  describe('in a hybrid mobile context', () => {
+    beforeEach(() => {
+      const platform = TestBed.inject(Platform);
+      (platform.is as any).withArgs('hybrid').and.returnValue(true);
+      const fixture = TestBed.createComponent(AppComponent);
+      fixture.detectChanges();
+    });
+
+    it('registers for updates', () => {
+      const application = TestBed.inject(ApplicationService);
+      expect(application.registerForUpdates).not.toHaveBeenCalled();
+    });
+  });
+
+  describe('in a web context', () => {
+    beforeEach(() => {
+      const platform = TestBed.inject(Platform);
+      (platform.is as any).withArgs('hybrid').and.returnValue(false);
+      const fixture = TestBed.createComponent(AppComponent);
+      fixture.detectChanges();
+    });
+
+    it('registers for updates', () => {
+      const application = TestBed.inject(ApplicationService);
+      TestBed.createComponent(AppComponent);
+      expect(application.registerForUpdates).toHaveBeenCalledTimes(1);
+    });
+  });
 });
```

### Code

In the `AppComponent`, inject the `ApplicationService` and `Platform` service. Implement the `OnInit` interface, registering for updates when not in a hybrid mobile context.

```diff
--- a/src/app/app.component.ts
+++ b/src/app/app.component.ts
@@ -1,7 +1,8 @@
 import { CommonModule } from '@angular/common';
 import { Component, OnInit } from '@angular/core';
 import { SplashScreen } from '@capacitor/splash-screen';
-import { IonicModule } from '@ionic/angular';
+import { IonicModule, Platform } from '@ionic/angular';
+import { ApplicationService } from './core';

 @Component({
   selector: 'app-root',
@@ -11,9 +12,12 @@ import { IonicModule } from '@ionic/angular';
   imports: [CommonModule, IonicModule],
 })
 export class AppComponent implements OnInit {
-  constructor() {}
+  constructor(private application: ApplicationService, private platform: Platform) {}

   ngOnInit() {
     SplashScreen.hide();
+    if (!this.platform.is('hybrid')) {
+      this.application.registerForUpdates();
+    }
   }
 }
```

## Conclusion

You can do another production build and redeploy your application if you wish. You now have a fully functioning application that you can easily deploy as either a hybrid mobile application or a PWA.
