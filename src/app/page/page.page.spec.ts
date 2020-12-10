import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController, NavController } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PagePage } from './page.page';
import { MarkdownViewModule } from '@app/markdown-view/markdown-view.module';
import { MenuItemsService } from '@app/core';
import { createMenuItemsServiceMock } from '@app/core/testing';
import {
  createActivatedRouteMock,
  createOverlayElementMock,
  createOverlayControllerMock,
  createNavControllerMock,
} from '@test/mocks';
import { PageMenuComponent } from '@app/page-menu/page-menu.component';
import { By } from '@angular/platform-browser';

describe('PagePage', () => {
  let component: PagePage;
  let fixture: ComponentFixture<PagePage>;
  let popover: HTMLIonPopoverElement;

  beforeEach(
    waitForAsync(() => {
      popover = createOverlayElementMock('Popover');
      TestBed.configureTestingModule({
        declarations: [PagePage],
        imports: [
          IonicModule,
          MarkdownViewModule,
          RouterModule.forRoot([], { relativeLinkResolution: 'legacy' }),
        ],
        providers: [
          { provide: ActivatedRoute, useFactory: createActivatedRouteMock },
          { provide: MenuItemsService, useFactory: createMenuItemsServiceMock },
          {
            provide: PopoverController,
            useFactory: () =>
              createOverlayControllerMock('PopoverController', popover),
          },
          { provide: NavController, useFactory: createNavControllerMock },
        ],
      }).compileComponents();

      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot.paramMap.get as any).and.returnValue('1');

      fixture = TestBed.createComponent(PagePage);
      component = fixture.componentInstance;
    }),
  );

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    describe('with a section without pages', () => {
      beforeEach(setupCourseWithoutPages);

      it('gets the section and page', () => {
        const menuItems = TestBed.inject(MenuItemsService);
        fixture.detectChanges();
        expect(menuItems.page).toHaveBeenCalledTimes(2);
        expect(menuItems.page).toHaveBeenCalledWith('git', undefined);
        expect(menuItems.page).toHaveBeenCalledWith(
          'git',
          undefined,
          undefined,
        );
      });

      it('sets the title based on the page', () => {
        fixture.detectChanges();
        const title = fixture.debugElement.query(By.css('ion-title'));
        expect(title.nativeElement.textContent).toEqual(
          'A Simple Git Workflow',
        );
      });

      it('sets the folder', () => {
        fixture.detectChanges();
        expect(component.folder).toBeUndefined();
      });

      it('sets the file', () => {
        fixture.detectChanges();
        expect(component.file).toEqual('git-workflow');
      });

      it('does not construct next', () => {
        fixture.detectChanges();
        expect(component.next).toBeUndefined();
      });

      it('does not construct prev', () => {
        fixture.detectChanges();
        expect(component.prev).toBeUndefined();
      });

      it('disables the menu', () => {
        fixture.detectChanges();
        expect(component.disableMenu).toBeTrue();
      });

      describe('when the page does not exist', () => {
        beforeEach(() => {
          const menuItems = TestBed.inject(MenuItemsService);
          (menuItems.page as any)
            .withArgs('git', undefined)
            .and.returnValue(undefined);
          (menuItems.page as any)
            .withArgs('git', undefined, undefined)
            .and.returnValue(undefined);
          fixture.detectChanges();
        });

        it('displays an invalid page title"', () => {
          const el = fixture.debugElement.query(By.css('ion-title'));
          expect(el.nativeElement.textContent).toEqual('Invalid Page');
        });

        it('displays an error message', () => {
          const el = fixture.debugElement.query(By.css('.error-message'));
          expect(el.nativeElement.textContent).toEqual('Page does not exist');
        });

        it('removes the markdown component', () => {
          const el = fixture.debugElement.query(By.css('app-markdown-view'));
          expect(el).toBeFalsy();
        });
      });
    });

    describe('with a section and a page', () => {
      beforeEach(setupCourseWithPages);

      it('gets the section and page', () => {
        const menuItems = TestBed.inject(MenuItemsService);
        fixture.detectChanges();
        expect(menuItems.page).toHaveBeenCalledTimes(2);
        expect(menuItems.page).toHaveBeenCalledWith('capacitor', undefined);
        expect(menuItems.page).toHaveBeenCalledWith('capacitor', undefined, 2);
      });

      it('sets the title based on the page', () => {
        fixture.detectChanges();
        const title = fixture.debugElement.query(By.css('ion-title'));
        expect(title.nativeElement.textContent).toEqual('Host the Application');
      });

      it('sets the folder', () => {
        fixture.detectChanges();
        expect(component.folder).toEqual('capacitor-lessons');
      });

      it('sets the file', () => {
        fixture.detectChanges();
        expect(component.file).toEqual('host');
      });

      it('constructs next', () => {
        fixture.detectChanges();
        expect(component.next).toEqual('/course/capacitor/page/3');
      });

      it('sets next to page 0 if on starting page', () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any)
          .withArgs('page')
          .and.returnValue('');
        fixture.detectChanges();
        expect(component.next).toEqual('/course/capacitor/page/0');
      });

      it('does not construct next if on last page', () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any)
          .withArgs('page')
          .and.returnValue('3');
        fixture.detectChanges();
        expect(component.next).toBeUndefined();
      });

      it('constructs prev', () => {
        fixture.detectChanges();
        expect(component.prev).toEqual('/course/capacitor/page/1');
      });

      it('does not construct prev if on first page', () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any)
          .withArgs('page')
          .and.returnValue('0');
        fixture.detectChanges();
        expect(component.prev).toBeUndefined();
      });

      it('enables the menu', () => {
        fixture.detectChanges();
        expect(component.disableMenu).toBeFalse();
      });

      describe('when the page does not exist', () => {
        beforeEach(() => {
          const menuItems = TestBed.inject(MenuItemsService);
          (menuItems.page as any)
            .withArgs('capacitor', undefined, 2)
            .and.returnValue(undefined);
          fixture.detectChanges();
        });

        it('displays an invalid page title"', () => {
          const el = fixture.debugElement.query(By.css('ion-title'));
          expect(el.nativeElement.textContent).toEqual('Invalid Page');
        });

        it('displays an error message', () => {
          const el = fixture.debugElement.query(By.css('.error-message'));
          expect(el.nativeElement.textContent).toEqual('Page does not exist');
        });

        it('removes the markdown component', () => {
          const el = fixture.debugElement.query(By.css('app-markdown-view'));
          expect(el).toBeFalsy();
        });
      });
    });

    describe('with a section, tab, and a page', () => {
      beforeEach(setupCourseWithTabs);

      it('gets the section and page', () => {
        const menuItems = TestBed.inject(MenuItemsService);
        fixture.detectChanges();
        expect(menuItems.page).toHaveBeenCalledTimes(2);
        expect(menuItems.page).toHaveBeenCalledWith('ionic-framework', 'react');
        expect(menuItems.page).toHaveBeenCalledWith(
          'ionic-framework',
          'react',
          2,
        );
      });

      it('sets the title based on the page', () => {
        fixture.detectChanges();
        const title = fixture.debugElement.query(By.css('ion-title'));
        expect(title.nativeElement.textContent).toEqual('Style the App');
      });

      it('sets the folder', () => {
        fixture.detectChanges();
        expect(component.folder).toEqual('ionic-react');
      });

      it('sets the file', () => {
        fixture.detectChanges();
        expect(component.file).toEqual('style');
      });

      it('constructs next', () => {
        fixture.detectChanges();
        expect(component.next).toEqual(
          '/course/ionic-framework/tabs/react/page/3',
        );
      });

      it('does not construct next if on last page', () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any)
          .withArgs('page')
          .and.returnValue('4');
        fixture.detectChanges();
        expect(component.next).toBeUndefined();
      });

      it('constructs prev', () => {
        fixture.detectChanges();
        expect(component.prev).toEqual(
          '/course/ionic-framework/tabs/react/page/1',
        );
      });

      it('does not construct prev if on first page', () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any)
          .withArgs('page')
          .and.returnValue('0');
        fixture.detectChanges();
        expect(component.prev).toBeUndefined();
      });

      it('enables the menu', () => {
        fixture.detectChanges();
        expect(component.disableMenu).toBeFalse();
      });

      describe('when the page does not exist', () => {
        beforeEach(() => {
          const menuItems = TestBed.inject(MenuItemsService);
          (menuItems.page as any)
            .withArgs('ionic-framework', 'react', 2)
            .and.returnValue(undefined);
          fixture.detectChanges();
        });

        it('displays an invalid page title"', () => {
          const el = fixture.debugElement.query(By.css('ion-title'));
          expect(el.nativeElement.textContent).toEqual('Invalid Page');
        });

        it('displays an error message', () => {
          const el = fixture.debugElement.query(By.css('.error-message'));
          expect(el.nativeElement.textContent).toEqual('Page does not exist');
        });

        it('removes the markdown component', () => {
          const el = fixture.debugElement.query(By.css('app-markdown-view'));
          expect(el).toBeFalsy();
        });
      });
    });
  });

  describe('show menu', () => {
    beforeEach(async () => {
      (popover.onWillDismiss as any).and.returnValue(
        Promise.resolve({ data: undefined, role: 'backdrop' }),
      );
      setupCourseWithPages();
      fixture.detectChanges();
    });

    it('creates a popover menu', async () => {
      const popoverController = TestBed.inject(PopoverController);
      const evt = new Event('click');
      await component.showMenu(evt);
      expect(popoverController.create).toHaveBeenCalledTimes(1);
      expect(popoverController.create).toHaveBeenCalledWith({
        component: PageMenuComponent,
        event: evt,
        componentProps: {
          menuItems: [
            'What is Capacitor',
            'What are devices',
            'Host the Application',
            'Test the Application',
          ],
        },
      });
    });

    it('navigates to the chosen page', async () => {
      const evt = new Event('click');
      const navController = TestBed.inject(NavController);
      (popover.onWillDismiss as any).and.returnValue(
        Promise.resolve({ data: 1, role: 'select' }),
      );
      await component.showMenu(evt);
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith(
        '/course/capacitor/page/1',
      );
    });

    it('does not navigate if a menu item was not selected', async () => {
      const evt = new Event('click');
      const navController = TestBed.inject(NavController);
      (popover.onWillDismiss as any).and.returnValue(
        Promise.resolve({ data: 2, role: 'somethingElse' }),
      );
      await component.showMenu(evt);
      expect(navController.navigateRoot).not.toHaveBeenCalled();
    });
  });

  function setupCourseWithoutPages() {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('section')
      .and.returnValue('git');
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('tabName')
      .and.returnValue(undefined);
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('page')
      .and.returnValue(undefined);
    const menuItems = TestBed.inject(MenuItemsService);
    (menuItems.url as any).and.returnValue('unexpected url call');
    (menuItems.url as any)
      .withArgs('git', undefined, undefined)
      .and.returnValue('/course/git');
    (menuItems.page as any).withArgs('git', undefined).and.returnValue({
      name: 'git',
      title: 'A Simple Git Workflow',
      file: 'git-workflow',
    });
    (menuItems.page as any)
      .withArgs('git', undefined, undefined)
      .and.returnValue({
        name: 'git',
        title: 'A Simple Git Workflow',
        file: 'git-workflow',
      });
    (menuItems.folder as any)
      .withArgs('capacitor', undefined, undefined)
      .and.returnValue(undefined);
  }

  function setupCourseWithPages() {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('section')
      .and.returnValue('capacitor');
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('tabName')
      .and.returnValue(undefined);
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('page')
      .and.returnValue('2');
    const menuItems = TestBed.inject(MenuItemsService);
    (menuItems.url as any).and.returnValue('unexpected url call');
    (menuItems.url as any)
      .withArgs('capacitor', undefined, 0)
      .and.returnValue('/course/capacitor/page/0');
    (menuItems.url as any)
      .withArgs('capacitor', undefined, 1)
      .and.returnValue('/course/capacitor/page/1');
    (menuItems.url as any)
      .withArgs('capacitor', undefined, 2)
      .and.returnValue('/course/capacitor/page/2');
    (menuItems.url as any)
      .withArgs('capacitor', undefined, 3)
      .and.returnValue('/course/capacitor/page/3');
    (menuItems.page as any).withArgs('capacitor', undefined).and.returnValue({
      name: 'capacitor',
      title: 'Dude, this is Capacitor',
      pages: [
        {
          title: 'What is Capacitor',
          file: 'overview',
        },
        {
          title: 'What are devices',
          file: 'devices',
        },
        {
          title: 'Host the Application',
          file: 'host',
        },
        {
          title: 'Test the Application',
          file: 'test',
        },
      ],
    });
    (menuItems.page as any)
      .withArgs('capacitor', undefined, 0)
      .and.returnValue({
        title: 'What is Capacitor',
        file: 'overview',
      });
    (menuItems.page as any)
      .withArgs('capacitor', undefined, 0)
      .and.returnValue({
        title: 'What are devices',
        file: 'devices',
      });
    (menuItems.page as any)
      .withArgs('capacitor', undefined, 2)
      .and.returnValue({
        title: 'Host the Application',
        file: 'host',
      });
    (menuItems.page as any)
      .withArgs('capacitor', undefined, 3)
      .and.returnValue({
        title: 'Test the Application',
        file: 'test',
      });
    (menuItems.folder as any)
      .withArgs('capacitor', undefined, 2)
      .and.returnValue('capacitor-lessons');
  }

  function setupCourseWithTabs() {
    const course = {
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
    };
    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('section')
      .and.returnValue('ionic-framework');
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('tabName')
      .and.returnValue('react');
    (activatedRoute.snapshot.paramMap.get as any)
      .withArgs('page')
      .and.returnValue('2');
    const menuItems = TestBed.inject(MenuItemsService);
    (menuItems.url as any).and.returnValue('unexpected url call');
    (menuItems.url as any)
      .withArgs('ionic-framework', 'react', 0)
      .and.returnValue('/course/ionic-framework/tabs/react/page/0');
    (menuItems.url as any)
      .withArgs('ionic-framework', 'react', 1)
      .and.returnValue('/course/ionic-framework/tabs/react/page/1');
    (menuItems.url as any)
      .withArgs('ionic-framework', 'react', 2)
      .and.returnValue('/course/ionic-framework/tabs/react/page/2');
    (menuItems.url as any)
      .withArgs('ionic-framework', 'react', 3)
      .and.returnValue('/course/ionic-framework/tabs/react/page/3');
    (menuItems.url as any)
      .withArgs('ionic-framework', 'react', 4)
      .and.returnValue('/course/ionic-framework/tabs/react/page/4');
    (menuItems.page as any)
      .withArgs('ionic-framework', 'react')
      .and.returnValue(course.tabs[1]);
    (menuItems.page as any)
      .withArgs('ionic-framework', 'react', 2)
      .and.returnValue(course.tabs[1].pages[2]);
    (menuItems.folder as any)
      .withArgs('ionic-framework', 'react', 2)
      .and.returnValue('ionic-react');
  }
});
