import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { MenuItemsService } from './menu-items.service';
import { MenuItem } from '@app/models';

describe('MenuItemsService', () => {
  let testMenu: { pages: Array<MenuItem> };
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    initializeTestData();
  });

  it('should be created', () => {
    const service: MenuItemsService = TestBed.inject(MenuItemsService);
    expect(service).toBeTruthy();
  });

  describe('load', () => {
    it('reads the menu.json file', () => {
      const service: MenuItemsService = TestBed.inject(MenuItemsService);
      service.load();
      const req = httpTestingController.expectOne('assets/data/menu.json');
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });
  });

  describe('after load', () => {
    let service: MenuItemsService;
    beforeEach(
      waitForAsync(() => {
        service = TestBed.inject(MenuItemsService);
        service.load();
        const req = httpTestingController.expectOne('assets/data/menu.json');
        req.flush(testMenu);
      }),
    );

    describe('main menu', () => {
      it('returns the title, icon, and path for each top level item', () => {
        expect(service.mainMenu).toEqual([
          {
            name: 'start',
            title: 'Getting Started',
            icon: 'reader',
            url: '/course/start',
          },
          {
            name: 'ionic-framework',
            title: 'Ionic Framework',
            icon: 'logo-ionic',
            url: '/course/ionic-framework/tabs/angular',
          },
          {
            name: 'pwa',
            title: 'PWA / Ionic',
            icon: 'logo-pwa',
            url: '/course/pwa/tabs/angular/page/0',
          },
          {
            name: 'cordova-to-capacitor',
            title: 'Cordova to Capacitor',
            icon: 'logo-capacitor',
            url: '/course/cordova-to-capacitor',
          },
          {
            name: 'git-workflow',
            title: 'A Simple git Workflow',
            icon: 'logo-git',
            url: '/course/git-workflow',
          },
          {
            name: 'appendix',
            title: 'References',
            icon: 'reader',
            url: '/course/appendix',
          },
        ]);
      });
    });

    describe('url', () => {
      it('is empty without a course', () => {
        expect(service.url('', 'angular')).toEqual('');
      });

      it('handles just a course', () => {
        expect(service.url('something')).toEqual('/course/something');
      });

      it('handles a course and tab', () => {
        expect(service.url('something', 'react')).toEqual(
          '/course/something/tabs/react',
        );
      });

      it('handles a course, tab, and page', () => {
        expect(service.url('something', 'react', 4)).toEqual(
          '/course/something/tabs/react/page/4',
        );
      });

      it('handles a course and page', () => {
        expect(service.url('something', '', 4)).toEqual(
          '/course/something/page/4',
        );
      });

      it('handles a course, tab, and page 0', () => {
        expect(service.url('something', 'react', 0)).toEqual(
          '/course/something/tabs/react/page/0',
        );
      });

      it('handles a course and page 0', () => {
        expect(service.url('something', '', 0)).toEqual(
          '/course/something/page/0',
        );
      });
    });

    describe('redirect url', () => {
      it('is empty without a course', () => {
        expect(service.redirectUrl('', 'angular')).toEqual('');
      });

      it('is empty if the course does not exist', () => {
        expect(service.redirectUrl('something')).toEqual('');
      });

      it('is just the course if there is a file for it', () => {
        expect(service.redirectUrl('start')).toEqual('/course/start');
      });

      it('is the course and first tab if there is no file but there are tabs', () => {
        expect(service.redirectUrl('ionic-framework')).toEqual(
          '/course/ionic-framework/tabs/angular',
        );
      });

      it('is the course and first page of the first tab if there is no file for the first tab', () => {
        expect(service.redirectUrl('pwa')).toEqual(
          '/course/pwa/tabs/angular/page/0',
        );
      });

      it('is just the course if there is a file and pages for it', () => {
        expect(service.redirectUrl('cordova-to-capacitor')).toEqual(
          '/course/cordova-to-capacitor',
        );
      });

      it('is the course and first page if there is not file and not tabs but there are pages', () => {
        const course = testMenu.pages.find(
          x => x.name === 'cordova-to-capacitor',
        );
        delete course.file;
        expect(service.redirectUrl('cordova-to-capacitor')).toEqual(
          '/course/cordova-to-capacitor/page/0',
        );
      });

      it('uses the tab name if given', () => {
        expect(service.redirectUrl('ionic-framework', 'react')).toEqual(
          '/course/ionic-framework/tabs/react',
        );
      });

      it('reverts to the first tab if the tab name is not valid', () => {
        expect(service.redirectUrl('ionic-framework', 'vue')).toEqual(
          '/course/ionic-framework/tabs/angular',
        );
      });

      it('goes to the first page of the tabs if the tab has no file', () => {
        expect(service.redirectUrl('pwa', 'react')).toEqual(
          '/course/pwa/tabs/react/page/0',
        );
      });
    });

    describe('page', () => {
      it('returns undefined without a course', () => {
        expect(service.page('')).toBeUndefined();
        expect(service.page('', 'react')).toBeUndefined();
        expect(service.page('', 'react', 2)).toBeUndefined();
        expect(service.page('', '', 2)).toBeUndefined();
      });

      it('returns undefined with an invalid course', () => {
        expect(service.page('something')).toBeUndefined();
      });

      it('returns undefined with an invalid tab', () => {
        expect(service.page('ionic-framework', 'nuxy')).toBeUndefined();
      });

      it('returns undefined with an invalid page', () => {
        expect(service.page('ionic-framework', 'nuxy', 4)).toBeUndefined();
        expect(
          service.page('cordova-to-capacitor', 'angular', 1),
        ).toBeUndefined();
      });

      it('returns a course page', () => {
        expect(service.page('ionic-framework')).toEqual(testMenu.pages[1]);
      });

      it('returns a tab page', () => {
        expect(service.page('ionic-framework', 'angular')).toEqual(
          testMenu.pages[1].tabs[0],
        );
      });

      it('returns a tab sub-page', () => {
        expect(service.page('ionic-framework', 'angular', 2)).toEqual(
          testMenu.pages[1].tabs[0].pages[2],
        );
      });

      it('returns a course sub-page', () => {
        expect(service.page('cordova-to-capacitor', '', 1)).toEqual(
          testMenu.pages[3].pages[1],
        );
      });
    });

    describe('folder', () => {
      it('returns undefined without a course', () => {
        expect(service.folder('')).toBeUndefined();
        expect(service.folder('', 'react')).toBeUndefined();
        expect(service.folder('', 'react', 2)).toBeUndefined();
        expect(service.folder('', '', 2)).toBeUndefined();
      });

      it('returns undefined with an invalid course', () => {
        expect(service.folder('something')).toBeUndefined();
      });

      it('returns undefined with an invalid tab', () => {
        expect(service.folder('ionic-framework', 'nuxy')).toBeUndefined();
      });

      it('returns undefined with an invalid page', () => {
        expect(service.folder('ionic-framework', 'nuxy', 4)).toBeUndefined();
        expect(
          service.page('cordova-to-capacitor', 'angular', 1),
        ).toBeUndefined();
      });

      it('returns the folder name for a course', () => {
        expect(service.folder('pwa')).toEqual('pwa-goodies');
      });

      it('finds the nearest folder name for a tab', () => {
        expect(service.folder('pwa', 'angular')).toEqual('pwa-goodies');
        expect(service.folder('pwa', 'react')).toEqual('ionic-react-pwa');
      });

      it('finds the nearest folder name for a page', () => {
        expect(service.folder('pwa', 'angular', 0)).toEqual('pwa-goodies');
        expect(service.folder('pwa', 'react', 0)).toEqual('ionic-react-pwa');
        expect(service.folder('pwa', 'angular', 2)).toEqual('links');
        expect(service.folder('pwa', 'react', 2)).toEqual('links');
        expect(service.folder('cordova-to-capacitor', '', 2)).toEqual(
          'cordova-to-capacitor',
        );
      });
    });
  });

  const initializeTestData = () => {
    testMenu = {
      pages: [
        {
          name: 'start',
          title: 'Getting Started',
          file: 'getting-started',
        },
        {
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
        },
        {
          name: 'pwa',
          title: 'PWA / Ionic',
          icon: 'logo-pwa',
          folder: 'pwa-goodies',
          tabs: [
            {
              name: 'angular',
              title: 'Angular',
              icon: 'logo-angular',
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
                  file: 'pwa-links',
                  folder: 'links',
                },
              ],
            },
            {
              name: 'react',
              title: 'React',
              icon: 'logo-react',
              folder: 'ionic-react-pwa',
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
                  file: 'pwa-links',
                  folder: 'links',
                },
              ],
            },
          ],
        },
        {
          name: 'cordova-to-capacitor',
          title: 'Cordova to Capacitor',
          folder: 'cordova-to-capacitor',
          file: 'intro',
          icon: 'logo-capacitor',
          pages: [
            {
              title: 'Create a Cordova Application',
              file: 'cordova',
            },
            {
              title: 'Convert to Capacitor',
              file: 'capacitor',
            },
            {
              title: 'Cleanup',
              file: 'cleanup',
            },
          ],
        },
        {
          name: 'git-workflow',
          title: 'A Simple git Workflow',
          icon: 'logo-git',
          file: 'simple-git-workflow',
        },
        {
          name: 'appendix',
          title: 'References',
          file: 'references',
        },
      ],
    };
  };
});
