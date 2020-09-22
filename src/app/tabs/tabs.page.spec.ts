import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { createMenuItemsServiceMock } from '@app/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { MenuItemsService } from '@app/core';
import { createActivatedRouteMock } from '@test/mocks';

import { TabsPage } from './tabs.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TabsPage],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: ActivatedRoute, useFactory: createActivatedRouteMock },
          { provide: MenuItemsService, useFactory: createMenuItemsServiceMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TabsPage);
      component = fixture.componentInstance;

      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot.paramMap.get as any)
        .withArgs('section')
        .and.returnValue('ionic-framework');
      const menuItemsService = TestBed.inject(MenuItemsService);
      (menuItemsService.page as any)
        .withArgs('ionic-framework')
        .and.returnValue({
          name: 'ionic-framework',
          icon: 'logo-ionic',
          title: 'Ionic Framework',
          tabs: [
            {
              name: 'angular',
              title: 'Angular',
              icon: 'logo-angular',
              folder: 'ionic-angular',
              file: 'intro',
              pages: [
                {
                  title: 'Get Started',
                  file: 'start',
                },
                {
                  title: 'Unit Tests',
                  file: 'unit-tests',
                },
                {
                  title: 'Switch Scale',
                  file: 'ionic-storage',
                },
                {
                  title: 'On Push Change Detection',
                  file: 'change-detection',
                },
              ],
            },
            {
              name: 'react',
              title: 'React',
              icon: 'logo-react',
              folder: 'ionic-react',
              file: 'intro',
              pages: [
                {
                  title: 'Get Started',
                  file: 'start',
                },
                {
                  title: 'Unit Tests',
                  file: 'unit-tests',
                },
                {
                  title: 'Style the App',
                  file: 'style',
                },
                {
                  title: 'Add Loading Indicator',
                  file: 'loading-indicator',
                },
                {
                  title: 'Switch Scale',
                  file: 'toggle-scale',
                },
              ],
            },
          ],
        });
    }),
  );

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('gets the course', () => {
      const menuItems = TestBed.inject(MenuItemsService);
      fixture.detectChanges();
      expect(menuItems.page).toHaveBeenCalledTimes(1);
      expect(menuItems.page).toHaveBeenCalledWith('ionic-framework');
    });
  });
});
