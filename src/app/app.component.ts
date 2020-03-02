import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';

import { MenuItemsService, ApplicationService } from '@app/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  selectedIndex = 0;
  appPages = [];

  constructor(
    private applicationService: ApplicationService,
    private menuItems: MenuItemsService,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    if (this.platform.is('hybrid')) {
      const { SplashScreen, StatusBar } = Plugins;
      SplashScreen.hide();
      StatusBar.setStyle({ style: StatusBarStyle.Light });
    } else {
      this.applicationService.registerForUpdates();
    }
  }

  async ngOnInit() {
    this.loadCourses();
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = parseInt(path, 10);
    }
  }

  private async loadCourses() {
    this.appPages = (await this.menuItems.courses()).map((x, idx) => ({
      title: x.title,
      url: `/folder/${idx}`,
      icon: x.icon || 'reader'
    }));
  }
}
