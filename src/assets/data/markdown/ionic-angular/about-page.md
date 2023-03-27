# Lab: The About Page

Every good app gives credit where credit is due. We will use a traditional "About" page for that in this app. This should be a short and mostly "for fun" lab, so let's get right to it.

## Get the Data

Modify the application's `tsconfig.json` file to the code to resolve JSON files. Also add `allowSyntheticDefaultImports` which will allow us to do a default style import:

```json
  "compilerOptions": {
...
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
...
```

This will allow us to read the `package.json` file and get some important information from it:

```typescript
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import packageInfo from '../../../package.json';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AboutPage {
  author: string;
  name: string;
  description: string;
  version: string;

  constructor() {
    this.author = packageInfo.author;
    this.name = packageInfo.name;
    this.description = packageInfo.description;
    this.version = packageInfo.version;
  }
}
```

In the template file for the about page, do the following:

- Change the title to "About Tea Taster"
- Add the following classes to the `ion-content`:
  - ion-text-center
  - ion-padding
- Add the following list markup within the `ion-content`

```html
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
```

## Move the Logout Logic

Currently, the logout logic is on the first page. Once the user has logged in, it is doubtful they will need to logout, so it would make more sense to put that functionality on a page like the "My Account" page, or "My Profile". We don't have one of those, but the about page will do for now.

Here is the full test:

```typescript
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthenticationService, SessionVaultService } from '@app/core';
import { createAuthenticationServiceMock, createSessionVaultServiceMock } from '@app/core/testing';
import { NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';
import { of } from 'rxjs';

import { AboutPage } from './about.page';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AboutPage],
    })
      .overrideProvider(AuthenticationService, { useFactory: createAuthenticationServiceMock })
      .overrideProvider(NavController, { useFactory: createNavControllerMock })
      .overrideProvider(SessionVaultService, { useFactory: createSessionVaultServiceMock })
      .compileComponents();

    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logout button', () => {
    describe('on click', () => {
      beforeEach(() => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.logout as jasmine.Spy).and.returnValue(of(undefined));
      });

      it('calls the logout', () => {
        const auth = TestBed.inject(AuthenticationService);
        const button = fixture.debugElement.query(By.css('[data-testid="logout-button"]')).nativeElement;
        click(button);
        expect(auth.logout).toHaveBeenCalledTimes(1);
      });

      it('clears the session', () => {
        const button = fixture.debugElement.query(By.css('[data-testid="logout-button"]')).nativeElement;
        const sessionVault = TestBed.inject(SessionVaultService);
        click(button);
        expect(sessionVault.clear).toHaveBeenCalledTimes(1);
      });

      it('navigates to the login page', fakeAsync(() => {
        const button = fixture.debugElement.query(By.css('[data-testid="logout-button"]')).nativeElement;
        const nav = TestBed.inject(NavController);
        click(button);
        tick();
        expect(nav.navigateRoot).toHaveBeenCalledTimes(1);
        expect(nav.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
      }));
    });
  });

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };
});
```

I leave it up to you to move the proper code from `tea.page.ts` and `tea.page.html` to here and then clean up the `TeaPage` code to remove any unused items. Be sure the clean up the `TeaPage` test as well.

## Conclusion

Congratulations, you have written a complete Ionic Framework app. Feel free to bump the version to 1.0.0 in your `package.json` file! 🥳🎉🤓
