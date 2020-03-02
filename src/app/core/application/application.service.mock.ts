import { ApplicationService } from './application.service';

export function createAppliationServiceMock() {
  return jasmine.createSpyObj<ApplicationService>('ApplicationService', ['registerForUpdates']);
}
