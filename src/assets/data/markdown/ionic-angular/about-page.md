# Lab: The About Page

Every good app gives credit where credit is due. We will use a traditional "About" page for that in this app. This should be a short and mostly "for fun" lab, so let's get right to it.

## Get the Data

Modify the application's `tsconfig.json` file to the code to resolve JSON files:

```json
  "compilerOptions": {
...
    "resolveJsonModule": true,
...
```

This will allow us to read the `package.json` file and get some important informtion from it:

```typescript
import { Component, OnInit } from '@angular/core';

import { author, name, description, version } from '../../../package.json';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  author: string;
  name: string;
  description: string;
  version: string;

  constructor() {}

  ngOnInit() {
    this.author = author;
    this.name = name;
    this.description = description;
    this.version = version;
  }
}
```

```html
<ion-header>
  <ion-toolbar>
    <ion-title>About Tea Taster</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-text-center ion-padding">
  <ion-list>
    <ion-list-header>About</ion-list-header>
    <ion-item>
      <ion-label>Name</ion-label>
      <ion-note slot="end">{{name}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Description</ion-label>
      <ion-note slot="end">{{description}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Version</ion-label>
      <ion-note slot="end">{{version}}</ion-note>
    </ion-item>
    <ion-item>
      <ion-label>Author</ion-label>
      <ion-note slot="end">{{author}}</ion-note>
    </ion-item>
  </ion-list>
</ion-content>
```

## Move the Logout Logic

Currently, the logout logic is on the first page. Once the user has logged in, it is doubtful they will need to logout, so it would make more sense to put that functionallity on a page like the "My Account" page, or "My Profile". We don't have one of those, but the about page will do for now.

Here is the full test:

```typescript
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AboutPage } from './about.page';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AboutPage],
      imports: [IonicModule],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logout', () => {
    it('calls the logout', () => {
      const auth = TestBed.inject(AuthenticationService);
      component.logout();
      expect(auth.logout).toHaveBeenCalledTimes(1);
    });
  });
});
```

I leave it up to you to move the proper code from `tea.page.ts` and `tea.page.html` to here and then clean up the `TeaPage` code to remove any unused items.

## Conclusion

Congratulations, you have written a complete Ionic Framework app. Feel free to bump the version to 1.0.0 in your `package.json` file! 🥳🎉🤓
