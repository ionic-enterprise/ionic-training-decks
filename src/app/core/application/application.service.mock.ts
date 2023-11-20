export const createApplicationServiceMock = () =>
  jasmine.createSpyObj('ApplicationService', {
    registerForUpdates: undefined,
  });
