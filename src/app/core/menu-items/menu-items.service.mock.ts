import { MenuItemsService } from './menu-items.service';

export const createMenuItemsServiceMock = () =>
  jasmine.createSpyObj<MenuItemsService>('MenuItemsService', {
    courses: Promise.resolve([]),
    mainMenu: [],
    folder: undefined,
    page: undefined,
    url: undefined,
    redirectUrl: undefined,
  });
