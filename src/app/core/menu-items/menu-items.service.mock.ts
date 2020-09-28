import { MenuItemsService } from './menu-items.service';

export function createMenuItemsServiceMock() {
  return jasmine.createSpyObj<MenuItemsService>('MenuItemsService', {
    courses: Promise.resolve([]),
    mainMenu: [],
    folder: undefined,
    page: undefined,
    url: undefined,
    redirectUrl: undefined,
  });
}
