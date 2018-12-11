# Lab: Use a Service

In this lab, you will:

- create a service
- move logic into the service
- use the service in the page

Currently, the `home.page.ts` page knows too many things. It knows how to supply the page with the information that it needs and handle events on the page, however it also knows how to take pictures. The code for the page should only know how to do one thing. That one thing should be (loosly defined) how to handle user interactions with the page. That is, it should know how to provide the proper data and how to respond to user events. The other logic should be moved into a service that knows how to take pictures.

## Create a Service

Use the `ionic generate service` command to create a `photos` service. This will use whatever path is specified  in order to create the service and a unit test for the service.

```bash
~/Projects/photo-gallery (master): ionic g service services/photos/photos
> ng generate service services/photos/photos
CREATE src/app/services/photos/photos.service.spec.ts (333 bytes)
CREATE src/app/services/photos/photos.service.ts (135 bytes)
[OK] Generated service!
```

## Set up the Test

The test setup can be (mostly) copied from the page test:

```TypeScript
describe('PhotosService', () => {
  let originalCamera;
  let sanitizer;

  beforeEach(() => {
    originalCamera = Plugins.Camera;
    Plugins.Camera = jasmine.createSpyObj('Camera', {
      getPhoto: Promise.resolve({ base64Data: '1234ABC88495' })
    });
    sanitizer = jasmine.createSpyObj('DomSanitizer', {
      bypassSecurityTrustResourceUrl: 'this-is-a-safe-value'
    });
    TestBed.configureTestingModule({
      providers: [{ provide: DomSanitizer, useValue: sanitizer }]
    });
  });

  afterEach(() => {
    Plugins.Camera = originalCamera;
  });
  ...
```

The same holds true for the `takePicture()` logic. It is copied with only minor modifications:

```TypeScript
  describe('takePicture', () => {
    let photos: PhotosService;
    beforeEach(() => {
      photos = TestBed.get(PhotosService);
    });

    it('gets the photo from the camera', () => {
      photos.takePicture();
      expect(Plugins.Camera.getPhoto).toHaveBeenCalledTimes(1);
    });

    it('sanitizes the data', async () => {
      await photos.takePicture();
      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledTimes(1);
      expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        '1234ABC88495'
      );
    });

    it('resolves the sanitized image', async () => {
      const image = await photos.takePicture();
      expect(image).toEqual('this-is-a-safe-value');
    });
  });
```

## Move the Logic into a the Service

The logic is (mostly) copied from the page. The biggest difference being that it does not assign the `image` value (a page concern). Instead it returns the sanitized image resource.

```TypeScript
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CameraResultType, CameraSource, Plugins } from '@capacitor/core';

@Injectable(
  providedIn: 'root'
})
export class PhotosService {
  constructor(private sanitizer: DomSanitizer) {}

  async takePicture(): Promise<SafeResourceUrl> {
    const { Camera } = Plugins;

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      image && image.base64Data
    );
  }
}
```

## Use the Service in the Page

### Modify the Test

Since the page will no longer directly access the Capacitor API, the Capacitor Camera API no longer needs to be stubbed. The same is true for the 

```TypeScript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';
import { PhotosService } from '../services/photos/photos.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let photos;

  beforeEach(async(() => {
    photos = jasmine.createSpyObj('PhotoService', {
      takePicture: Promise.resolve('this-is-the-resolved-image')
    });
    TestBed.configureTestingModule({
      declarations: [HomePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: PhotosService, useValue: photos }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('takePicture', () => {
    it('takes a picture', () => {
      component.takePicture();
      expect(photos.takePicture).toHaveBeenCalledTimes(1);
    });

    it('assigns the resolved image', async () => {
      await component.takePicture();
      expect(component.image).toEqual('this-is-the-resolved-image');
    });
  });
});
```

### Modify the Page

The Capacitor API related logic is stripped out and replaced by calling our new service. This also removes the need for the `DomSanitizer`. All of those details are abstracted out into the service so the page does not need to know about them.

```TypeScript
import { Component } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { PhotosService } from '../services/photos/photos.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  image: SafeResourceUrl;

  constructor(private photos: PhotosService) {}

  async takePicture(): Promise<void> {
    this.image = await this.photos.takePicture();
  }
}
```