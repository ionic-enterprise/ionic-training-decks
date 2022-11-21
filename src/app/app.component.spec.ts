import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { NavController, Platform } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { createNavControllerMock, createPlatformMock } from '@test/mocks';
import { MenuItemsService, ApplicationService } from '@app/core';
import { createMenuItemsServiceMock, createAppliationServiceMock } from '@app/core/testing';
import { SplashScreen } from '@capacitor/splash-screen';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
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
  }));

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('hides the splash screen', () => {
    spyOn(SplashScreen, 'hide');
    const fixture = TestBed.createComponent(AppComponent);
    TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
  });

  describe('initialization', () => {
    describe('as a hybrid mobile app', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform as any).is.withArgs('hybrid').and.returnValue(true);
      });

      it('does not register for updates', () => {
        const application = TestBed.inject(ApplicationService);
        TestBed.createComponent(AppComponent);
        expect(application.registerForUpdates).not.toHaveBeenCalled();
      });
    });

    describe('as any app other than hybrid mobile', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform as any).is.withArgs('hybrid').and.returnValue(false);
      });

      it('registers for updates', () => {
        const application = TestBed.inject(ApplicationService);
        TestBed.createComponent(AppComponent);
        expect(application.registerForUpdates).toHaveBeenCalledTimes(1);
      });
    });
  });
});
