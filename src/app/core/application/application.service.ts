import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(
    private alertController: AlertController,
    private update: SwUpdate,
  ) {}

  registerForUpdates() {
    this.update.versionUpdates.pipe(filter((evt) => evt.type === 'VERSION_READY')).subscribe(() => this.promptUser());
  }

  private async promptUser() {
    const alert = await this.alertController.create({
      header: 'Update Available',
      message:
        'An update is available for this application. Would you like to restart this application to get the update?     ',
      buttons: [
        { text: 'Yes', role: 'confirm' },
        { text: 'No', role: 'cancel' },
      ],
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    if (result.role === 'confirm') {
      this.update.activateUpdate().then(() => document.location.reload());
    }
  }
}
