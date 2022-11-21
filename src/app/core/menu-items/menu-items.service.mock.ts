import { MenuItemsService } from './menu-items.service';

export const createMenuItemsServiceMock = () => {
  const spy = jasmine.createSpyObj<MenuItemsService>('MenuItemsService', {
    courses: Promise.resolve([]),
    folder: undefined,
    page: undefined,
    url: undefined,
    redirectUrl: undefined,
  });
  (spy as any).mainMenu = [];
  return spy;
};
