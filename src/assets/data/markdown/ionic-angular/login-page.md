# Lab: Add a Login Page

Most applications have more than one page. This application will eventually have several. Let's start by adding a login page.

In this lab, you will learn how to:

- Create new pages
- Set up basic routes

## Generate the Page

The `ionic generate` command allows you to generate several different types of objects: components, pages, pipes, services, etc. It ties into the Angular `ng generate` command and builds on top of it with some of its own schematics. One of those schematics is for the `page` object. Let's create a page now:

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

We see that a `login` route was automatically added for us. Let's see if that works by changing the route in our browser to 'http://localhost:8100/login' (your port number may be different). We should be able to navigate to that location just fine. The page is blank, but we can tell that the route is actually working.

## Use Reactive Forms

This is a very simple form, and we could get away with using a template driven form. However, the Reactive forms are far more flexible and ultimately more extensible. As such, we will use them instead. Open `src/app/login/login.module.ts` and import the `ReactiveFormsModule` instead of the `FormsModule`.

```typescript
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';

@NgModule({
  imports: [CommonModule, IonicModule, LoginPageRoutingModule, ReactiveFormsModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}
```

## Mock the UI

First we will add our "title test", but in this case we will only have the single title. There is no reason for the collapsible title on this page.

We also added the `ReactiveFormsModule` to the `TestBed` configuration. We don't need that now, but we will shortly.

```TypeScript
...
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
...
      TestBed.configureTestingModule({
        declarations: [LoginPage],
        imports: [IonicModule, ReactiveFormsModule],
      }).compileComponents();
...
  it('displays the title properly', () => {
    // see the tea page test
    // the big differences: there is only ONE title here and it should be "Login"
  });
```

Notice that the test fails, but we are about to fix that.

**Reminder:** Angular's test server often does not pick up new `*.spec.ts` files so you may need to kill the existing `npm test` run and restart it to see the failed test.

For this page, we will follow the very common <a ref="https://ionicframework.com/docs/layout/structure#header-and-footer" target="_blank">Header and Footer</a> UI pattern. This pattern contains a header with the page title and perhaps some controls (sch as a back button) as applicable, a content section with the main content, and a footer section that typically contains action buttons. Let's mock up the UI for that now.

Our `ion-header` already contains what we need.

We know we are going to need a form in which to enter our e-mail and our password. We will place this form inside of our `ion-content` area.

We also know that we need an action button for the user to press once they have entered their credentials. We will place that inside the `ion-footer` section.

When we are done, our page markup looks like this:

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Login</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <form>
    <ion-input label="E-Mail Address"></ion-input>
    <ion-input label="Password"></ion-input>
  </form>
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-button>Sign In</ion-button>
  </ion-toolbar>
</ion-footer>
```

That's a start, but let's pretty it up a bit. First, let's use the "floating" style labels by adding `label-placement="floating"` to each input. Here is an example:

```html
<ion-input label="Foo Bar" label-placement="floating"></ion-input>
```

We should also give the inputs `id`, `name`, and `type` attributes as well as setting the `errorText` property:

- `id="email-input" name="email" type="email" [errorText]="emailError"`
- `id="password-input" name="password" type="password" [errorText]="passwordError"`

The `emailError` and `passwordError` will need to be defined in the page's class:

```typescript
  get emailError(): string {
    return 'Unknown error';
  }

  get passwordError(): string {
    return 'Unknown error';
  }
```

Now the password shows us markers instead of the text we are typing. This also gets us ready for work we will need to do later.

The form itself looks a little crowded. You can try adding the `ion-padding` class to the `ion-content` to see what that does.

Finally, the button should:

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

Pay particular attention to the `slot` on the `ion-icon` (`slot="end"`). A slot defines where a child element will be positioned in the parent element. The button component (parent) <a href="https://ionicframework.com/docs/api/button#slots" target="_blank">defines various slots</a>. The child component (`ion-icon` in this case) specifies which slot to use <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots#adding_flexibility_with_slots" target=_blank>via the slot attribute</a>. We point it out here only because it sometimes is a source of confusion for developers who are new to the `slot` paradigm.

## Form Handling

### Set Up the Page Class

For now the `LoginPage` class does not have to do much. It just needs to have a couple of properties to bind to the input fields. It also needs a handler for the button. At this time, the handler will just output a message to the console.

```TypeScript
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  loginForm = this.fb.group({
    email: [''],
    password: [''],
  });

  ...

  constructor(private fb: FormBuilder) {}

  signIn() {
    console.log(this.loginForm.controls.email.value, this.loginForm.controls.password.value);
  }
}
```

### Binding the Data

Switch back to the test file. The bindings should be tested to make sure they are done correctly. Here are the tests for the Email Address input. Add these and then create similar tests for the password input.

Notice how we are using the `nativeElement` along with standard JavaScript DOM APIs in these tests. We could have also used the `debugElement` and used its `.query(By.css(...))` syntax like before, and then gone down to the native element for the rest of the test. You can use whichever method you are most comfortable with. You should also take into consideration which methodology is going to work best within your test. In these tests we need the HTML element, so I just went that route right away.

```TypeScript
  describe('email input binding', () => {
    it('updates the component model when the input changes', () => {
      const input = fixture.nativeElement.querySelector('#email-input');
      const event = new InputEvent('ionInput');

      input.value = 'test@test.com';
      input.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.loginForm.controls.email.value).toEqual('test@test.com');
    });

    it('updates the input when the component model changes', ()=>{
      component.loginForm.controls.email.setValue('testy@mctesterson.com');
      const input = fixture.nativeElement.querySelector('#email-input');
      expect(input.value).toEqual('testy@mctesterson.com');
    });
  });
```

Hook up the inputs in the templates. First, the form needs to be associated with our `loginForm`:

```html
<form [formGroup]="loginForm"></form>
```

Next the `formControlName` needs to be set for each of the inputs.

Here is the E-Mail Address input:

```html
<ion-input
  ... (already existing attributes like 'id', 'label', etc)
  formControlName="email"
></ion-input>
```

The password input test and markup is similar:

```TypeScript
  describe('password input binding', () => {
    it('updates the component model when the input changes', () => {
      const input = fixture.nativeElement.querySelector('#password-input');
      const event = new InputEvent('ionInput');

      input.value = 'MyPas$Word';
      input.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.loginForm.controls.password.value).toEqual('MyPas$Word');
    });

    it('updates the input when the component model changes', () => {
      component.loginForm.controls.password.setValue('SomePassword');
      const input = fixture.nativeElement.querySelector('#password-input');
      expect(input.value).toEqual('SomePassword');
    });
  });
```

```html
<ion-input
  ... (already existing attributes like 'id', 'label', etc)
  formControlName="password"
></ion-input>
```

### Test Refactor

Those tests are getting very verbose, especially when it comes to setting a value in one of the form inputs. Let's clean that up a bit.

Add a `setInputValue()` function within the main `describe()`.

```TypeScript
const setInputValue = (input: HTMLIonInputElement, value: string) => {
  const event = new InputEvent('ionInput');
  input.value = value;
  input.dispatchEvent(event);
  fixture.detectChanges();
};
```

With that in place, clean up the tests. Your tests should now look more like this:

```typescript
it('updates the component model when the input changes', () => {
  const input = fixture.nativeElement.querySelector('#password-input');
  setInputValue(input, 'MyPas$Word');
  expect(component.loginForm.password.value).toEqual('MyPas$Word');
});
```

### Display Error Messages

The `errorText` property of `ion-input` will show error messages when the input is dirty and in an invalid state. We currently are just binding a generic error message:

```typescript
get emailError(): string {
  return 'Unknown error';
}

get passwordError(): string {
  return 'Unknown error';
}
```

Let's think about the types of messages we want with each input. Both fields are required. In addition, the e-mail field needs to be a properly formatted e-mail address. Here is the test for the e-mail input:

```typescript
it('generates appropriate error messages', () => {
  const input = fixture.nativeElement.querySelector('#email-input');
  expect(component.emailError).toBe('Required');
  setInputValue(input, 'test');
  expect(component.emailError).toBe('Invalid format');
  setInputValue(input, 'test@test.com');
  expect(component.emailError).toBe('Unknown error');
  setInputValue(input, '');
  expect(component.emailError).toBe('Required');
  setInputValue(input, 'test@test.com');
  expect(component.emailError).toBe('Unknown error');
});
```

Place that inside the appropriate `describe` block and then add a similar test for the password input (it will not have the "Invalid format" message).

The form system will determine whether or not the error message should be displayed, we just need to make sure we have one. The "Unknown error" means we either don't have an error (in which case the form will not show the message) or we do not know exactly what the error is.

Turning our attention to the code, we need to do two things:

- Add the validations to the form controls.
- Generate the messages in our getters.

First the validations. Add `Validators` to the import from `@angular/forms`, then update the code where we build `loginForm`:

```typescript
loginForm = this.fb.group({
  email: ['', [Validators.email, Validators.required]],
  password: ['', Validators.required],
});
```

With the validations hooked up, we need to make sure we output the proper error. Here is the code for `emailError`:

```typescript
get emailError(): string {
  const email = this.loginForm.controls.email;
  return email.errors?.['required'] ? 'Required' : email.errors?.['email'] ? 'Invalid format' : 'Unknown error';
}
```

Make similar changes to `passwordError`.

Now when we enter and delete data in the page, we should see error messages as appropriate under the inputs.

### Disable button

The user should not be able to click the "Sign In" button if the form itself is not valid. Also, when the user does click on the button our page should do something. What that _something_ is currently is undefined, but we will bind the event so it is ready once we do define what it should do.

Let's use our tests to define when the button should be enabled and disabled.

```TypeScript
  describe('signin button', () => {
    let button: HTMLIonButtonElement;
    let email: HTMLIonInputElement;
    let password: HTMLIonInputElement;

    beforeEach(() => {
      button = fixture.nativeElement.querySelector('ion-button');
      email = fixture.nativeElement.querySelector('#email-input');
      password = fixture.nativeElement.querySelector('#password-input');
    });

    it('starts disabled', () => {
      expect(button.disabled).toEqual(true);
    });

    it('is disabled with just an email address', () => {
      setInputValue(email, 'test@test.com');
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
    <ion-button id="signin-button" expand="full" [disabled]="!loginForm.valid" (click)="signIn()"
      >Sign In
      <ion-icon slot="end" name="log-in-outline"></ion-icon>
    </ion-button>
  </ion-toolbar>
</ion-footer>
```

## Conclusion

We now have a (mostly) functional login page. The only problems are that we have to manually navigate to it, and it doesn't actually perform the login. Before we fix that we are going to need to need to create a couple of services. We will do that next.
