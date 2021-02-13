import { ApplicationService } from './application.service';

export const createAppliationServiceMock = () =>
  jasmine.createSpyObj<ApplicationService>('ApplicationService', [
    'registerForUpdates',
  ]);
