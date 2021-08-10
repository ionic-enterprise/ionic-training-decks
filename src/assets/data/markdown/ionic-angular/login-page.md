# Lab: Add a Login Page

Most applications have more than one page. This application will eventually have several. Let's start by adding a login page.

In this lab, you will learn how to:

- Create new pages
- Set up basic routes

## Generate the Page

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

We see that a `login` route was automatically added for us. Let's see if that works by changing the route in our browser to 'http://localhost:8100/login'. We should be able to navigate to that location just fine. We won't see it, but we can tell that the route is actually working.

## Mock the UI

First we will add our "title test", but in this case we will only have the single title. There is no reason for the collapsible title on this page.

We also added the `FormsModule` to the `TestBed` configuration. We don't need that now, but we will shortly.

```TypeScript
...
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
...
      TestBed.configureTestingModule({
        declarations: [LoginPage],
        imports: [FormsModule, IonicModule],
      }).compileComponents();
...
  it('displays the title properly', () => {
    const title = fixture.debugElement.query(By.css('ion-title'));
    expect(title.nativeElement.textContent.trim()).toBe('Login');
  });
```

Notice that the test fails, but we are about to fix that.

Let's mock up what we would like this page to look like. We know we are going to need a form in which to enter our e-mail and our password, along with a button to press when the user is ready to log in, so let's start by updating the `src/app/login/login.page.html` file.

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
    <ion-button>Sign In</ion-button>
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

### Set Up the Page Class

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

### Binding the Data

Switch back to the test file. The bindings should be tested to make sure they are done correctly. Here are the tests for the Email Address input. Add these and then create similar tests for the password input. You will have to import `fakeAsync` and `tick` from `@angular/core/testing`.

Notice how we are using the `nativeElement` along with standard JavaScript DOM APIs in these tests. We could have also used the `debugElement` and used its `.query(By.css(...))` syntax like before, and then gone down to the native element for the rest of the test. You can use whichever method you are most comfortable with combined with whatever is going to best meet the needs of your test. In these tests we need the HTML element, so I just went that route right away.

```TypeScript
  describe('email input binding', () => {
    it('updates the component model when the input changes', () => {
      const input = fixture.nativeElement.querySelector('#email-input');
      const event = new InputEvent('ionChange');

      input.value = 'test@test.com';
      input.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.email).toEqual('test@test.com');
    });

    it('updates the input when the component model changes', fakeAsync(()=>{
      component.email = 'testy@mctesterson.com';
      fixture.detectChanges();
      tick();
      const input = fixture.nativeElement.querySelector('#email-input');
      expect(input.value).toEqual('testy@mctesterson.com');
    }));
  });
```

Hook up the inputs in the templates. The following should be added to both of the inputs:

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

The password input test and markup is similar:

```TypeScript
  describe('password input binding', () => {
    it('updates the component model when the input changes', () => {
      const input = fixture.nativeElement.querySelector('#password-input');
      const event = new InputEvent('ionChange');

      input.value = 'MyPas$Word';
      input.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.password).toEqual('MyPas$Word');
    });

    it('updates the input when the component model changes', fakeAsync(() => {
      component.password = 'SomePassword';
      fixture.detectChanges();
      tick();
      const input = fixture.nativeElement.querySelector('#password-input');
      expect(input.value).toEqual('SomePassword');
    }));
  });
```

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

### Disable button

The user should not be able to click the "Sign In" button if the form itself is not valid. Also, when the user does click on the button our page should do something. What that _something_ is currently is undefined, but we will bind the event so it is ready once we do define what it should do.

Let's use our tests to define when the button should be enabled and disabled.

```TypeScript
  describe('signin button', () => {
    let button: HTMLIonButtonElement;
    let email: HTMLIonInputElement;
    let password: HTMLIonInputElement;
    let event: InputEvent;
    beforeEach(fakeAsync(() => {
      button = fixture.nativeElement.querySelector('ion-button');
      email = fixture.nativeElement.querySelector('#email-input');
      password = fixture.nativeElement.querySelector('#password-input');
      event = new InputEvent('ionChange');
      fixture.detectChanges();
      tick();
    }));

    it('starts disabled', () => {
      expect(button.disabled).toEqual(true);
    });

    it('is disabled with just an email address', () => {
      email.value = 'test@test.com';
      email.dispatchEvent(event);
      fixture.detectChanges();

      expect(button.disabled).toEqual(true);
    });

    it('is disabled with just a password', () => {
      // TODO: Fill this in
    });

    it('is enabled with both an email address and a password', () => {
      // TODO: Fill this in
    });

    it('is disabled when the email address is not a valid format', () => {
      // TODO: Fill this in
    });
  });
```

Be sure to fill in the logic for the missing tests.

Now that we have the tests, let's update the HTML with the proper bindings.

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

### Test Refactor

Those tests are getting very verbose, especially when it comes to setting a value in one of the form inputs. Let's clean that up a bit.

Add a `setInputValue()` function within the main `describe()`.

```TypeScript
const setInputValue = (input: HTMLIonInputElement, value: string) => {
  const event = new InputEvent('ionChange');
  input.value = value;
  input.dispatchEvent(event);
  fixture.detectChanges();
};
```

With that in place, clean up the tests.

### Display Error Messages

If the data in one of the inputs is invalid, the Sign In button will be disabled, which is good, but the user will not know why, which is bad. So let's add a section where we display some helpful messages for the user. We will modify the form to display the following error messages when appropriate:

- E-Mail Address must have a valid format
- E-Mail Address is required
- Password is required

First let's use our tests to define when the error messages should be displayed:

```typescript
describe('error messages', () => {
  let errorDiv: HTMLDivElement;
  let email: HTMLIonInputElement;
  let password: HTMLIonInputElement;
  beforeEach(fakeAsync(() => {
    errorDiv = fixture.nativeElement.querySelector('.error-message');
    email = fixture.nativeElement.querySelector('#email-input');
    password = fixture.nativeElement.querySelector('#password-input');
    fixture.detectChanges();
    tick();
  }));

  it('starts with no error message', () => {
    expect(errorDiv.textContent).toEqual('');
  });

  it('displays an error message if the e-mail address is dirty and empty', () => {
    setInputValue(email, 'test@test.com');
    setInputValue(email, '');
    expect(errorDiv.textContent.trim()).toEqual('E-Mail Address is required');
  });

  it('displays an error message if the e-mail address has an invalid format', () => {
    // TODO: Fill this in
  });

  it('clears the error message when the e-mail address has a valid format', () => {
    // TODO: Fill this in
  });

  it('displays an error message if the password is dirty and empty', () => {
    // TODO: Fill this in
  });
});
```

Now let's update the form. Add the following to the lower portion of the form, after the `ion-list` but before the closing tag for the `form`:

```html
<div class="error-message">
  <div *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)">
    <div *ngIf="emailInput.errors.email">E-Mail Address must have a valid format</div>
    <div *ngIf="emailInput.errors.required">E-Mail Address is required</div>
  </div>

  <div *ngIf="passwordInput.invalid && (passwordInput.dirty || passwordInput.touched)">
    <div *ngIf="passwordInput.errors.required">Password is required</div>
  </div>
</div>
```

That is helpful, but a little styling will make it look better. Since this is not the only page where we _could_ potentially want to display the error messages, let's add this to the `src/global.scss` file:

```scss
.error-message {
  padding: 2em;
  color: var(--ion-color-danger, #ff0000);
}
```

## Conclusion

We now have a (mostly) funcitonal login page. The only problems are that we have to manually navigate to it, and it doesn't actually perform the login. Before we fix that far we are going to need to need to create a couple of services. We will do that next.
