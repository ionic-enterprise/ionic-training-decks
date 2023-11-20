import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular/standalone';
import { createOverlayControllerMock, createOverlayElementMock } from '@test/mocks';
import { Subject } from 'rxjs';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let alert: HTMLIonAlertElement;
  beforeEach(() => {
    alert = createOverlayElementMock('Alert');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useFactory: () => ({
            versionUpdates: new Subject(),
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
      (alert.onDidDismiss as any).and.returnValue(Promise.resolve({ role: 'cancel' }));
      const service: ApplicationService = TestBed.inject(ApplicationService);
      service.registerForUpdates();
    });

    it('asks the user if they would like an update on VERSION_READY', () => {
      const update = TestBed.inject(SwUpdate);
      const alertController = TestBed.inject(AlertController);
      expect(alertController.create).not.toHaveBeenCalled();
      (update.versionUpdates as any).next({ type: 'VERSION_READY' });
      expect(alertController.create).toHaveBeenCalledTimes(1);
      expect(alertController.create).toHaveBeenCalled();
    });

    it('does not ask the user on VERSION_INSTALLATION_FAILED', () => {
      const update = TestBed.inject(SwUpdate);
      const alertController = TestBed.inject(AlertController);
      expect(alertController.create).not.toHaveBeenCalled();
      (update.versionUpdates as any).next({ type: 'VERSION_INSTALLATION_FAILED' });
      expect(alertController.create).not.toHaveBeenCalled();
    });

    it('does not ask the user on VERSION_DETECTED', () => {
      const update = TestBed.inject(SwUpdate);
      const alertController = TestBed.inject(AlertController);
      expect(alertController.create).not.toHaveBeenCalled();
      (update.versionUpdates as any).next({ type: 'VERSION_DETECTED' });
      expect(alertController.create).not.toHaveBeenCalled();
    });
  });
});
