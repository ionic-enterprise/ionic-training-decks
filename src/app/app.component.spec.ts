import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Plugins, StatusBarStyle } from '@capacitor/core';

import { NavController, Platform } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { createNavControllerMock, createPlatformMock } from '@test/mocks';
import { MenuItemsService, ApplicationService } from '@app/core';
import {
  createMenuItemsServiceMock,
  createAppliationServiceMock,
} from '@app/core/testing';

describe('AppComponent', () => {
  let originalSplashScreen: any;
  let originalStatusBar: any;

  beforeEach(
    waitForAsync(() => {
      originalSplashScreen = Plugins.SplashScreen;
      originalStatusBar = Plugins.StatusBar;
      Plugins.StatusBar = jasmine.createSpyObj('StatusBar', ['setStyle']);
      Plugins.SplashScreen = jasmine.createSpyObj('SplashScreen', ['hide']);
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {
            provide: ApplicationService,
            useFactory: createAppliationServiceMock,
          },
          { provide: MenuItemsService, useFactory: createMenuItemsServiceMock },
          { provide: NavController, useFactory: createNavControllerMock },
          { provide: Platform, useFactory: createPlatformMock },
        ],
        imports: [RouterTestingModule.withRoutes([])],
      }).compileComponents();
    }),
  );

  afterEach(() => {
    Plugins.SplashScreen = originalSplashScreen;
    Plugins.StatusBar = originalStatusBar;
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('initialization', () => {
    describe('as a hybrid mobile app', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform as any).is.withArgs('hybrid').and.returnValue(true);
      });

      it('hides the splash screen', fakeAsync(() => {
        TestBed.createComponent(AppComponent);
        tick();
        expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
      }));

      it('sets the status bar style to light', fakeAsync(() => {
        TestBed.createComponent(AppComponent);
        tick();
        expect(Plugins.StatusBar.setStyle).toHaveBeenCalledTimes(1);
        expect(Plugins.StatusBar.setStyle).toHaveBeenCalledWith({
          style: StatusBarStyle.Light,
        });
      }));

      it('does not register for updates', fakeAsync(() => {
        const application = TestBed.inject(ApplicationService);
        TestBed.createComponent(AppComponent);
        expect(application.registerForUpdates).not.toHaveBeenCalled();
        tick();
        expect(application.registerForUpdates).not.toHaveBeenCalled();
      }));
    });

    describe('as any app other than hybrid mobile', () => {
      it('does not hide the splash screen', fakeAsync(() => {
        TestBed.createComponent(AppComponent);
        tick();
        expect(Plugins.SplashScreen.hide).not.toHaveBeenCalled();
      }));

      it('does not set the status bar style', fakeAsync(() => {
        TestBed.createComponent(AppComponent);
        tick();
        expect(Plugins.StatusBar.setStyle).not.toHaveBeenCalled();
      }));

      it('registers for updates', fakeAsync(() => {
        const application = TestBed.inject(ApplicationService);
        TestBed.createComponent(AppComponent);
        expect(application.registerForUpdates).not.toHaveBeenCalled();
        tick();
        expect(application.registerForUpdates).toHaveBeenCalledTimes(1);
      }));
    });
  });
});
