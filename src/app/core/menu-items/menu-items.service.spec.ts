import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { MenuItemsService } from './menu-items.service';
import { MenuItem } from '@app/models';

describe('MenuItemsService', () => {
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    const service: MenuItemsService = TestBed.inject(MenuItemsService);
    expect(service).toBeTruthy();
  });

  it('reads the menu.json file', () => {
    TestBed.inject(MenuItemsService);
    const req = httpTestingController.expectOne('assets/data/menu.json');
    expect(req.request.method).toEqual('GET');
    httpTestingController.verify();
  });

  describe('courses', () => {
    it('returns the top level items', fakeAsync(() => {
      let items: Array<MenuItem>;
      const service: MenuItemsService = TestBed.inject(MenuItemsService);
      const req = httpTestingController.expectOne('assets/data/menu.json');
      service.courses().then(x => (items = x));
      req.flush(testMenu);
      tick();
      expect(items).toEqual(testMenu.pages);
    }));
  });

  const testMenu = {
    pages: [
      {
        title: 'Getting Started',
        file: 'getting-started',
      },
      {
        title: 'Ionic / Angular / Cordova',
        folder: 'ionic-angular-cordova',
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
        title: 'PWA / Ionic / Angular / Cordova',
        folder: 'ionic-angular-cordova-pwa',
        file: 'intro',
        pages: [
          {
            title: 'Host the Application',
            file: 'host',
          },
          {
            title: 'Add the PWA Goodies',
            file: 'pwa',
          },
          {
            title: 'PWA Links',
            file: 'links',
          },
        ],
      },
      {
        title: 'Ionic / React / Capacitor',
        folder: 'ionic-react-capacitor',
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
      {
        title: 'A Simple git Workflow',
        file: 'simple-git-workflow',
      },
      {
        title: 'References',
        file: 'references',
      },
    ],
  };
});
