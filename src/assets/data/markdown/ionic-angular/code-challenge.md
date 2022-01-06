# Lab: Code Challenge

This lab is a code challenge where we provide _some_ of the code, and you provide the rest. Let's see how you do. If you get stuck, please ask and we can work through the parts you are stuck on together.

## Challenge - Complete the Logout

Right now, we have a login, but we have no logout. Add a logout button to the tea page as such:

```diff
--- a/src/app/tea/tea.page.html
+++ b/src/app/tea/tea.page.html
@@ -1,6 +1,11 @@
 <ion-header [translucent]="true">
   <ion-toolbar>
     <ion-title>Teas</ion-title>
+    <ion-buttons slot="end">
+      <ion-button (click)="logout()" data-testid="logout-button">
+        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
+      </ion-button>
+    </ion-buttons>
   </ion-toolbar>
 </ion-header>
```

Here is the test for how it should work

```diff
--- a/src/app/tea/tea.page.spec.ts
+++ b/src/app/tea/tea.page.spec.ts
@@ -2,9 +2,13 @@ import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
 import { DebugElement } from '@angular/core';
 import { By } from '@angular/platform-browser';
 import { IonicModule } from '@ionic/angular';
+import { Store } from '@ngrx/store';
+import { provideMockStore } from '@ngrx/store/testing';

+import { AuthState, initialState } from '@app/store/reducers/auth.reducer';
 import { TeaPage } from './tea.page';
 import { Tea } from '@app/models';
+import {logout} from '@app/store/actions';

 describe('TeaPage', () => {
   let component: TeaPage;
@@ -17,6 +21,11 @@ describe('TeaPage', () => {
       TestBed.configureTestingModule({
         declarations: [TeaPage],
         imports: [IonicModule],
+        providers: [
+          provideMockStore<{ auth: AuthState }>({
+            initialState: { auth: initialState },
+          }),
+        ],
       }).compileComponents();

       fixture = TestBed.createComponent(TeaPage);
@@ -80,6 +89,25 @@ describe('TeaPage', () => {
     });
   });

+  describe('logout button', () => {
+    it('dispatches the logout button', () => {
+      const button = fixture.debugElement.query(
+        By.css('[data-testid="logout-button"]'),
+      );
+      const store = TestBed.inject(Store);
+      spyOn(store, 'dispatch');
+      click(button.nativeElement);
+      expect(store.dispatch).toHaveBeenCalledTimes(1);
+      expect(store.dispatch).toHaveBeenCalledWith(logout());
+    });
+  });
+
+  const click = (button: HTMLElement) => {
+    const event = new Event('click');
+    button.dispatchEvent(event);
+    fixture.detectChanges();
+  }
+
   const initializeTestData = () => {
     teas = [
       {
```

Get those in place. At that point, your challenge is to add the items that make the rest of this work. Specifically:

- write the logout method within the tea page class such that the above test passes
- we have the actions and reducers for the logout, but we have no effects
  - write a test for the `logout$` effect
  - write the `logout$` effect
  - write a test for the `logoutSuccess$` effect (the path navigated to should be `/login`)
  - write the `logoutSuccess$` effect

**Hint #1:** at this time, the `logout$` effect only needs to do two things:

- clear the session
- dispatch the `logoutSuccess` event.

This makes the tests for it similar to the "on login success" tests for the `login$` effect, only without all of the argument passing and checking since the `logout` related actions and methods do not take arguments. Also, the session is cleared instead of saved.

**Hint #2:** `logoutSuccess$` is a lot like `loginSuccess$` with only the details of the action and the actual path navigated to differing. This makes `loginSuccess$` a pretty good model for what you need to do.

**Hint #3:** I included the tests at the bottom of this page, but try to write your own before peeking.

When you are done, test out your work in the app. When you log in, you should be taken to the teas page just like before. When you press the logout button you should end up at the login page.

## Conclusion

Hopefully you got through that without issue, but if you have any questions please let me know and we can go through it.

As promised, here is one way to test the `logout$` effect:

```diff
--- a/src/app/store/effects/auth.effects.spec.ts
+++ b/src/app/store/effects/auth.effects.spec.ts
@@ -9,6 +9,8 @@ import {
   login,
   loginSuccess,
+  logout,
+  logoutSuccess,
 } from '@app/store/actions';
 import { AuthEffects } from './auth.effects';
 import { SessionVaultService } from '@app/core';
@@ -211,4 +213,37 @@ describe('AuthEffects', () => {
       });
     });
   });
+
+  describe('logout$', () => {
+    it('clears the session from storage', done => {
+      const sessionVaultService = TestBed.inject(SessionVaultService);
+      actions$ = of(logout());
+      effects.logout$.subscribe(() => {
+        expect(sessionVaultService.logout).toHaveBeenCalledTimes(1);
+        done();
+      });
+    });
+
+    it('dispatches the logout success event', done => {
+      actions$ = of(logout());
+      effects.logout$.subscribe(action => {
+        expect(action).toEqual({
+          type: '[Auth API] logout success',
+        });
+        done();
+      });
+    });
+  });
+
+  describe('logoutSuccess$', () => {
+    it('navigates to the login path', done => {
+      const navController = TestBed.inject(NavController);
+      actions$ = of( logoutSuccess());
+      effects.logoutSuccess$.subscribe(() => {
+        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
+        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
+        done();
+      });
+    });
+  });
 });
```
