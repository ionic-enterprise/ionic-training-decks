import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, PopoverController, NavController } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FolderPage } from './folder.page';
import { MarkdownViewModule } from '@app/markdown-view/markdown-view.module';
import { MenuItemsService } from '@app/core';
import { createMenuItemsServiceMock } from '@app/core/testing';
import {
  createActivatedRouteMock,
  createOverlayElementMock,
  createOverlayControllerMock,
  createNavControllerMock
} from '@test/mocks';
import { PageMenuComponent } from '@app/page-menu/page-menu.component';

describe('FolderPage', () => {
  let component: FolderPage;
  let fixture: ComponentFixture<FolderPage>;
  let popover;

  beforeEach(async(() => {
    popover = createOverlayElementMock('Popover');
    TestBed.configureTestingModule({
      declarations: [FolderPage],
      imports: [IonicModule, MarkdownViewModule, RouterModule.forRoot([])],
      providers: [
        { provide: ActivatedRoute, useFactory: createActivatedRouteMock },
        { provide: MenuItemsService, useFactory: createMenuItemsServiceMock },
        { provide: PopoverController, useFactory: () => createOverlayControllerMock('PopoverController', popover) },
        { provide: NavController, useFactory: createNavControllerMock }
      ]
    }).compileComponents();

    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute.snapshot.paramMap.get as any).and.returnValue('1');
    const menuItems = TestBed.inject(MenuItemsService);
    (menuItems.courses as any).and.returnValue(Promise.resolve(testItems));

    fixture = TestBed.createComponent(FolderPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    describe('with a section and a page', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('2');
        (activatedRoute.snapshot.paramMap.get as any).withArgs('page').and.returnValue('0');
        fixture.detectChanges();
      });

      it('sets the title', () => {
        expect(component.title).toEqual('Host the Application');
      });

      it('sets the folder', () => {
        expect(component.folder).toEqual('ionic-angular-cordova-pwa');
      });

      it('sets the file', () => {
        expect(component.file).toEqual('host');
      });

      it('constructs next', () => {
        expect(component.next).toEqual(['/', 'folder', '2', '1']);
      });

      it('constructs prev', () => {
        expect(component.prev).toEqual(['/', 'folder', '2']);
      });

      it('enables the menu', () => {
        expect(component.disableMenu).toBeFalse();
      });
    });

    describe('with a page outside of range', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('2');
        (activatedRoute.snapshot.paramMap.get as any)
          .withArgs('page')
          .and.returnValue(testItems[2].pages.length.toString());
        fixture.detectChanges();
      });

      it('does not set the title', () => {
        expect(component.title).toBeFalsy();
      });

      it('does not set the folder', () => {
        expect(component.folder).toBeFalsy();
      });

      it('does not set the file', () => {
        expect(component.file).toBeFalsy();
      });

      it('sets an error message', () => {
        expect(component.errorMessage).toEqual('Page number is invalid');
      });

      it('does not construct next', () => {
        expect(component.next).toBeFalsy();
      });

      it('does not construct prev', () => {
        expect(component.prev).toBeFalsy();
      });

      it('disables the menu', () => {
        expect(component.disableMenu).toBeTrue();
      });
    });

    describe('with a page that is not a number', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('2');
        (activatedRoute.snapshot.paramMap.get as any).withArgs('page').and.returnValue('fred');
        fixture.detectChanges();
      });

      it('does not set the title', () => {
        expect(component.title).toBeFalsy();
      });

      it('does not set the folder', () => {
        expect(component.folder).toBeFalsy();
      });

      it('does not set the file', () => {
        expect(component.file).toBeFalsy();
      });

      it('sets an error message', () => {
        expect(component.errorMessage).toEqual('Page number is invalid');
      });

      it('does not construct next', () => {
        expect(component.next).toBeFalsy();
      });

      it('does not construct prev', () => {
        expect(component.prev).toBeFalsy();
      });

      it('disables the menu', () => {
        expect(component.disableMenu).toBeTrue();
      });
    });

    describe('with a page number on a section without pages', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('4');
        (activatedRoute.snapshot.paramMap.get as any).withArgs('page').and.returnValue('0');
        fixture.detectChanges();
      });

      it('does not set the title', () => {
        expect(component.title).toBeFalsy();
      });

      it('does not set the folder', () => {
        expect(component.folder).toBeFalsy();
      });

      it('does not set the file', () => {
        expect(component.file).toBeFalsy();
      });

      it('sets an error message', () => {
        expect(component.errorMessage).toEqual('Page number is invalid');
      });

      it('does not construct next', () => {
        expect(component.next).toBeFalsy();
      });

      it('does not construct prev', () => {
        expect(component.prev).toBeFalsy();
      });

      it('disables the menu', () => {
        expect(component.disableMenu).toBeTrue();
      });
    });

    describe('with a section and no page', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('3');
        (activatedRoute.snapshot.paramMap.get as any).withArgs('page').and.returnValue(null);
        fixture.detectChanges();
      });

      it('sets the title', () => {
        expect(component.title).toEqual('Ionic / React / Capacitor');
      });

      it('sets the folder', () => {
        expect(component.folder).toEqual('ionic-react-capacitor');
      });

      it('sets the file', () => {
        expect(component.file).toEqual('intro');
      });

      it('constructs the next target', () => {
        expect(component.next).toEqual(['/', 'folder', '3', '0']);
      });

      it('does not construct prev', () => {
        expect(component.prev).toBeFalsy();
      });

      it('enables the menu', () => {
        expect(component.disableMenu).toBeFalse();
      });
    });

    describe('with a section without pages and no page', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('4');
        (activatedRoute.snapshot.paramMap.get as any).withArgs('page').and.returnValue(null);
        fixture.detectChanges();
      });

      it('sets the title', () => {
        expect(component.title).toEqual('A Simple git Workflow');
      });

      it('sets the folder', () => {
        expect(component.folder).toBeFalsy();
      });

      it('sets the file', () => {
        expect(component.file).toEqual('simple-git-workflow');
      });

      it('does not construct next', () => {
        expect(component.next).toBeFalsy();
      });

      it('does not construct prev', () => {
        expect(component.prev).toBeFalsy();
      });

      it('disables the menu', () => {
        expect(component.disableMenu).toBeTrue();
      });
    });

    describe('with a section that is not a number', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('bob');
        (activatedRoute.snapshot.paramMap.get as any).withArgs('page').and.returnValue('0');
        fixture.detectChanges();
      });

      it('does not set the title', () => {
        expect(component.title).toBeFalsy();
      });

      it('does not set the folder', () => {
        expect(component.folder).toBeFalsy();
      });

      it('does not set the file', () => {
        expect(component.file).toBeFalsy();
      });

      it('sets an error message', () => {
        expect(component.errorMessage).toEqual('Section number is invalid');
      });

      it('does not construct next', () => {
        expect(component.next).toBeFalsy();
      });

      it('does not construct prev', () => {
        expect(component.prev).toBeFalsy();
      });

      it('disables the menu', () => {
        expect(component.disableMenu).toBeTrue();
      });
    });

    describe('with a section that is out of range', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue(testItems.length.toString());
        (activatedRoute.snapshot.paramMap.get as any).withArgs('page').and.returnValue('0');
        fixture.detectChanges();
      });

      it('does not set the title', () => {
        expect(component.title).toBeFalsy();
      });

      it('does not set the folder', () => {
        expect(component.folder).toBeFalsy();
      });

      it('does not set the file', () => {
        expect(component.file).toBeFalsy();
      });

      it('sets an error message', () => {
        expect(component.errorMessage).toEqual('Section number is invalid');
      });

      it('does not construct next', () => {
        expect(component.next).toBeFalsy();
      });

      it('does not construct prev', () => {
        expect(component.prev).toBeFalsy();
      });

      it('disables the menu', () => {
        expect(component.disableMenu).toBeTrue();
      });
    });

    describe('on the last page of a section', () => {
      beforeEach(async () => {
        const activatedRoute = TestBed.inject(ActivatedRoute);
        (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('1');
        (activatedRoute.snapshot.paramMap.get as any)
          .withArgs('page')
          .and.returnValue((testItems[1].pages.length - 1).toString());
        fixture.detectChanges();
      });

      it('does not construct next', () => {
        expect(component.next).toBeFalsy();
      });

      it('does not construct prev', () => {
        expect(component.prev).toEqual(['/', 'folder', '1', (testItems[1].pages.length - 2).toString()]);
      });

      it('disables only the foreward button', () => {
        expect(component.disableMenu).toBeFalse();
      });
    });
  });

  describe('show menu', () => {
    beforeEach(async () => {
      popover.onDidDismiss.and.returnValue(Promise.resolve({ data: undefined, role: 'backdrop' }));
      const activatedRoute = TestBed.inject(ActivatedRoute);
      const menuItems = TestBed.inject(MenuItemsService);
      (activatedRoute.snapshot.paramMap.get as any).withArgs('section').and.returnValue('1');
      fixture.detectChanges();
      await menuItems.courses();
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
          menuItems: ['Get Started', 'Unit Tests', 'Switch Scale', 'On Push Change Detection']
        }
      });
    });

    it('navigates to the chosen page', async () => {
      const evt = new Event('click');
      const navController = TestBed.inject(NavController);
      popover.onDidDismiss.and.returnValue(Promise.resolve({ data: 2, role: 'select' }));
      await component.showMenu(evt);
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'folder', '1', '2']);
    });

    it('does not navigate if a menu item was not selected', async () => {
      const evt = new Event('click');
      const navController = TestBed.inject(NavController);
      popover.onDidDismiss.and.returnValue(Promise.resolve({ data: 2, role: 'somethingElse' }));
      await component.showMenu(evt);
      expect(navController.navigateRoot).not.toHaveBeenCalled();
    });
  });

  const testItems = [
    {
      title: 'Getting Started',
      file: 'getting-started'
    },
    {
      title: 'Ionic / Angular / Cordova',
      folder: 'ionic-angular-cordova',
      file: 'intro',
      pages: [
        {
          title: 'Get Started',
          file: 'start'
        },
        {
          title: 'Unit Tests',
          file: 'unit-tests'
        },
        {
          title: 'Switch Scale',
          file: 'ionic-storage'
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
      pages: [
        {
          title: 'Get Started',
          file: 'start'
        },
        {
          title: 'Unit Tests',
          file: 'unit-tests'
        },
        {
          title: 'Style the App',
          file: 'style'
        },
        {
          title: 'Add Loading Indicator',
          file: 'loading-indicator'
        },
        {
          title: 'Switch Scale',
          file: 'toggle-scale'
        }
      ]
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
