# Lab: Add a Login Page

Most applications have more than one page. This application will eventually have several. Let's start by adding a login page.

In this lab, you will learn how to:

- Create new pages
- Set up basic routes


```bash
$ ionic generate page login
```

Here are the results of that command:

```bash
> ng generate page login --project=app
CREATE src/app/login/login-routing.module.ts (343 bytes)
CREATE src/app/login/login.module.ts (465 bytes)
CREATE src/app/login/login.page.scss (0 bytes)
CREATE src/app/login/login.page.html (124 bytes)
CREATE src/app/login/login.page.spec.ts (640 bytes)
CREATE src/app/login/login.page.ts (252 bytes)
UPDATE src/app/app-routing.module.ts (602 bytes)
[OK] Generated page!
```

Notice that it updated `src/app/app-routing.module.ts`. Let's see what it did there:

```diff
$ git diff src/app/app-routing.module.ts
diff --git a/src/app/app-routing.module.ts b/src/app/app-routing.module.ts
index af456b5..e6c9e39 100644
--- a/src/app/app-routing.module.ts
+++ b/src/app/app-routing.module.ts
@@ -11,6 +11,10 @@ const routes: Routes = [
     redirectTo: 'tea',
     pathMatch: 'full'
   },
+  {
+    path: 'login',
+    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
+  },
 ];

 @NgModule({
```

We see that a `login` route was automatically added for us. Let's see if that works by changing the route in our browser to 'http://localhost:8100/login'. We should be able to navigate to that location just fine. We won't see me, but we can tell that the route is actually working.

Let's mock up what we would like this page to look like. We know we are going to need a form in which to enter our e-mail and our password, along with a button to press when the user is ready to log in, so let's start there.

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Login</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <form #loginForm="ngForm">
    <ion-list>
      <ion-item>
        <ion-label>E-Mail Address</ion-label>
        <ion-input></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>Password</ion-label>
        <ion-input></ion-input>
      </ion-item>
    </ion-list>
  </form>
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-button>Login</ion-button>
  </ion-toolbar>
</ion-footer>
```

Well, that's a start, but let's pretty it up a bit. First, let's use the "floating" style labels like this: `<ion-label position="floating">Some Label</ion-label>`. Nice!

We should also give the inputs an `id`, a `name`, and a `type` like this:

```html
    <ion-list>
      <ion-item>
        <ion-label position="floating">E-Mail Address</ion-label>
        <ion-input id="email-input" name="email" type="email"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Password</ion-label>
        <ion-input id="password-input" name="password" type="password"></ion-input>
      </ion-item>
    </ion-list>
```

Now the password shows us markers instead of the text we are typing. This also gets us ready for work we will need to do later.

Finally, the button. It really should:

- have an `id`
- take up the whole screen width
- have a sign in icon to go with the text

```html
<ion-footer>
  <ion-toolbar>
    <ion-button id="signin-button" expand="full"
      >Sign In
      <ion-icon slot="end" name="log-in-outline"></ion-icon>
    </ion-button>
  </ion-toolbar>
</ion-footer>
```

## Form Handling

The test is already failing because we added an `ngForm` but did not had the `FormsModule` to the test file. Open `src/app/login/login.page.spec.ts` and add that now. You may as well also remove the `forRoot()` from the `IonicModule` import.

```TypeScript
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [FormsModule, IonicModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

For now the `LoginPage` class does not have to do much. It just needs to have a couple of properties to bind the input fields to and a handler for the button, though that handler will not really do anything yet.

```TypeScript
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email: string;
  password: string;

  constructor() {}

  signIn() {
    console.log(this.email, this.password);
  }
}
``` 

Finally hook up the inputs in the templates. The following should be added to both of the inputs:

- The `ngModel` binding (example: `[(ngModel)]="email"`)
- A template variable for the input (example: `#emailInput="ngModel"`)
- Any required validation directives (example: `email required`) 

Here is the E-Mail Address input:

```html
        <ion-input
          id="email-input"
          name="email"
          type="email"
          [(ngModel)]="email"
          #emailInput="ngModel"
          email
          required
        ></ion-input>
```

The password input is similar:

```html
        <ion-input
          id="password-input"
          name="password"
          type="password"
          [(ngModel)]="password"
          #passwordInput="ngModel"
          required
        ></ion-input>
```

## Disable button

The user should not be able to click the "Sign In" button if the form itself is not valid. Also, when the user does click on the button our page should do something. What that _something_ is currently is undefined, but we will bind the event so it is ready once we do define what it should do.

```html
<ion-footer>
  <ion-toolbar>
    <ion-button id="signin-button" expand="full" [disabled]="!loginForm.form.valid" (click)="signIn()"
      >Sign In
      <ion-icon slot="end" name="log-in-outline"></ion-icon>
    </ion-button>
  </ion-toolbar>
</ion-footer>
```

## Display Error Messages

If the data in one of the inputs is invalid, the Sign In button will be disabled, which is good, but the user will not know why, which is bad. So let's add a section where we display some helpful messages for the user. Add the following to the lower portion of the form:

```html
    <div class="error-message">
      <div *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)">
        <div *ngIf="emailInput.errors.email">
          E-Mail Address must have a valid format
        </div>
        <div *ngIf="emailInput.errors.required">
          E-Mail Address is required
        </div>
      </div>

      <div *ngIf="passwordInput.invalid && (passwordInput.dirty || passwordInput.touched)">
        <div *ngIf="passwordInput.errors.required">
          Password is required
        </div>
      </div>
    </div>
```

That is helpful, but a little styling will make it look better. Since this is not the only page where we _could_ potentially want to display the error messages, let's add this to the `src/global.scss` file:

```scss
.error-message {
  padding: 2em;
  color: var(--ion-color-danger, #ff0000)
}
```
