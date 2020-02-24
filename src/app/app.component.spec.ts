import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Plugins, StatusBarStyle } from '@capacitor/core';

import { Platform } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { createPlatformMock } from '@test/mocks';
import { MenuItemsService } from '@app/core';
import { createMenuItemsServiceMock } from '@app/core/testing';

describe('AppComponent', () => {
  let originalSplashScreen;
  let originalStatusBar;

  beforeEach(async(() => {
    originalSplashScreen = Plugins.SplashScreen;
    originalStatusBar = Plugins.StatusBar;
    Plugins.StatusBar = jasmine.createSpyObj('StatusBar', ['setStyle']);
    Plugins.SplashScreen = jasmine.createSpyObj('SplashScreen', ['hide']);
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MenuItemsService, useFactory: createMenuItemsServiceMock },
        { provide: Platform, useFactory: createPlatformMock }
      ],
      imports: [RouterTestingModule.withRoutes([])]
    }).compileComponents();
  }));

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
          style: StatusBarStyle.Light
        });
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
    });

    it('grabs the courses', () => {
      const menuItems = TestBed.inject(MenuItemsService);
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(menuItems.courses).toHaveBeenCalledTimes(1);
    });

    it('builds the menu items', async () => {
      const menuItems = TestBed.inject(MenuItemsService);
      (menuItems.courses as any).and.returnValue(Promise.resolve(testItems));
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      await menuItems.courses();
      expect(fixture.componentInstance.appPages).toEqual([
        { title: 'Getting Started', url: '/folder/0', icon: 'funny-face' },
        { title: 'Ionic / Angular / Cordova', url: '/folder/1', icon: 'logo-angular' },
        { title: 'PWA / Ionic / Angular / Cordova', url: '/folder/2', icon: 'logo-pwa' },
        { title: 'Ionic / React / Capacitor', url: '/folder/3', icon: 'logo-react' },
        { title: 'A Simple git Workflow', url: '/folder/4', icon: 'reader' },
        { title: 'References', url: '/folder/5', icon: 'reader' }
      ]);
    });
  });

  const testItems = [
    {
      title: 'Getting Started',
      file: 'getting-started',
      icon: 'funny-face'
    },
    {
      title: 'Ionic / Angular / Cordova',
      folder: 'ionic-angular-cordova',
      file: 'intro',
      icon: 'logo-angular',
      pages: [
        {
          title: 'Get Started',
          file: 'start'
        },
        {
          title: 'On Push Change Detection',
          file: 'change-detection'
        }
      ]
    },
    {
      title: 'PWA / Ionic / Angular / Cordova',
      folder: 'ionic-angular-cordova-pwa',
      file: 'intro',
      icon: 'logo-pwa',
      pages: [
        {
          title: 'Host the Application',
          file: 'host'
        },
        {
          title: 'Add the PWA Goodies',
          file: 'pwa'
        },
        {
          title: 'PWA Links',
          file: 'links'
        }
      ]
    },
    {
      title: 'Ionic / React / Capacitor',
      folder: 'ionic-react-capacitor',
      file: 'intro',
      icon: 'logo-react',
      pages: []
    },
    {
      title: 'A Simple git Workflow',
      file: 'simple-git-workflow'
    },
    {
      title: 'References',
      file: 'references'
    }
  ];
});
