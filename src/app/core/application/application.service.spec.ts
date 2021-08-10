import { TestBed } from '@angular/core/testing';
import { AlertController } from '@ionic/angular';
import { SwUpdate } from '@angular/service-worker';

import { ApplicationService } from './application.service';
import { Subject } from 'rxjs';
import { createOverlayControllerMock, createOverlayElementMock } from '@test/mocks';

describe('ApplicationService', () => {
  let alert;
  beforeEach(() => {
    alert = createOverlayElementMock('Alert');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useFactory: () => ({
            available: new Subject(),
          }),
        },
        {
          provide: AlertController,
          useFactory: () => createOverlayControllerMock('AlertController', alert),
        },
      ],
    });
  });

  it('should be created', () => {
    const service: ApplicationService = TestBed.inject(ApplicationService);
    expect(service).toBeTruthy();
  });

  describe('registered for updates', () => {
    beforeEach(() => {
      alert.onDidDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));
      const service: ApplicationService = TestBed.inject(ApplicationService);
      service.registerForUpdates();
    });

    it('asks the user if they would like an update', () => {
      const update = TestBed.inject(SwUpdate);
      const alertController = TestBed.inject(AlertController);
      expect(alertController.create).not.toHaveBeenCalled();
      (update.available as any).next();
      expect(alertController.create).toHaveBeenCalledTimes(1);
      expect(alertController.create).toHaveBeenCalled();
    });
  });
});
