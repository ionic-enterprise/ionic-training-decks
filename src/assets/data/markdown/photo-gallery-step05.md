# Lab: Take a Picture

In this lab, you will:

* add a button to the page
* handle the click event
* use the camera to take a picture
* test the application on the device

## Add a Button

*Note:* This step demonstrates how to add a button to the page using Ionic Studio. If you do not have Ionic Studio or would rather use an editor like VS Code you can still perform this step but will need to edit the HTML directly.

1. in Ionic Studio, select "Design" mode and make sure the "Home" page is selected
1. drag a "Fab" component onto the "Content" area of the page
1. make sure the "Fab" is selected in the compnent tree for the Home page then set the following properties on the right:
   1. Horizontal: center
   1. Vertical: bottom
1. expand the "Fab" in the component tree until you find the Icon for it (it should go Fab > Fab Button > Icon)
1. chage the Icon Name to "camera"
1. select the Text and Paragraph items that are in the tree and delete them

View the markup for the page in "Code" mode. The markup generated for the page should now look something like this:

```HTML
<ion-header>
  <ion-toolbar>
    <ion-title>
      Ionic Blank
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content padding>
  <ion-fab slot horizontal="center" vertical="bottom">
    <ion-fab-button>
      <ion-icon name="camera"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>
```

Add an image to the `ion-content` component to display the image: `<img [src]="image" *ngIf="image">`

## Handle the Click Event

When the button is clicked the application should perform an action. In order to facilitate that, a click event handler must be added to the button.

1. in Ionic Studio, select "Design" mode and make sure the "Home" page is selected
1. select the Fab in the component tree for the page
1. on the right, select the On Click dropdown then choose "Add New..."
1. type "takePicture" in the "Method name" prompt at the bottom of Ionic Studio

In "Code" view, notice that a click event has been added: ` <ion-fab slot horizontal="center" vertical="bottom" (click)="takePicture()">`

Open the `home.page.ts` file. As of the time of this writing, Ionic Studio does not add a stub for the method, so we will create one ourself as such:

```TypeScript
  takePicture() {
    console.log('take my picture!!');
  }
```

## Use the Camera API

At this time, clicking the camera button logs a message to the console. The application needs to be changed to access the camera in order to take a picture.

### Test First

Using a "Test First" or "Test Driven Design" philosophy means first creating a failing test and then writing the code that satisfy the requirement that is expressed by the test.

Taking a look at the Angular Example on the <a href="https://capacitor.ionicframework.com/docs/apis/camera/" target="_blank">Capacitor Camera API</a> documentation, we will need to to provide spies for the Camera plugin and for the DomSanitizer service.

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let originalCamera;
  let sanitizer;

  beforeEach(async(() => {
    originalCamera = Plugins.Camera;
    Plugins.Camera = jasmine.createSpyObj('Camera', {
      getPhoto: Promise.resolve({ base64Data: '1234ABC88495' })
    });
    sanitizer = jasmine.createSpyObj('DomSanitizer', {
      bypassSecurityTrustResourceUrl: 'this-is-a-safe-value'
    });
    TestBed.configureTestingModule({
      declarations: [HomePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: DomSanitizer, useValue: sanitizer }]
    }).compileComponents();
  }));

  afterEach(() => {
    Plugins.Camera = originalCamera;
  });
  ...
});
```

### Test and Code

We will create the test in `home.spec.ts` and then create the code to satisfy the test. Here is a full rundown of what we need to do:

* use the camera to get a photo
* sanitize the data returned from the camera
* assign the sanitized output to the `image` property

For reasons of expediency, this will be the only section that reviewes a typical "Test First" workflow. You are encouraged to adopt such a workflow yourself to help identify issues early and often, before they get out to users.

#### Describe the Method

First we will need a `describe` section for the `takePicture()` method:

```TypeScript
  describe('takePicture', () => {
    // tests will go here
  });
```

#### Get the Photo

*Test:*

```TypeScript
  describe('takePicture', () => {
    it('gets the photo from the camera', () => {
      component.takePicture();
      expect(Plugins.Camera.getPhoto).toHaveBeenCalledTimes(1);
    });
  });
```

*Note:* all subsequent tests will also be within the 'takePicture` `describe()` block.

*Code:*

```TypeScript
  async takePicture(): Promise<void> {
    const { Camera } = Plugins;

    await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
  }
```

#### Sanitize the Data

*Test:*

```TypeScript
    it('sanitizes the data', async () => {
      await component.takePicture();
      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledTimes(1);
      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('1234ABC88495');
    });
```

*Code:*

Now we need to inject the sanitizer into the page and use it. Be sure to import the `DomSanitizer` class as the top of the file. The `SafeResourceUrl` interface can be imported as well. It will be required in the next step.

```TypeScript
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

  ...

  constructor(private sanitizer: DomSanitizer) {}

  async takePicture(): Promise<void> {
    const { Camera } = Plugins;

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.sanitizer.bypassSecurityTrustResourceUrl(
      image && image.base64Data
    );
  }
```

#### Assign the Image

*Test:*

```TypeScript
    it('assigns the sanitized image', async () => {
      await component.takePicture();
      expect(component.image).toEqual('this-is-a-safe-value');
    });
```

*Code:*

*Note:* unchanged code has been snipped, leaving just enough for context

```TypeScript
...
export class HomePage {
  image: SafeResourceUrl;
  ...
  async takePicture(): Promise<void> {
    ...
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(
      image && image.base64Data
    );
  }
}
```

## Build for the Device

Now that the application is using the camera, it needs to run on a device that has a camera.

```bash
ionic build
ionic capacitor copy
ionic capacitor open ios
ionic capacitor open android
```

At this point the IDEs for iOS and/or Android should be open and the application can be built and run from there in the usual manner.