import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';

import { MenuItemsService, ApplicationService } from '@app/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  selectedIndex = 0;
  appPages = [];

  constructor(
    private applicationService: ApplicationService,
    private menuItems: MenuItemsService,
    private navController: NavController,
    private platform: Platform,
    private route: ActivatedRoute,
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    if (this.platform.is('hybrid')) {
      const { SplashScreen } = Plugins;
      SplashScreen.hide();
      this.styleByMode();
    } else {
      this.applicationService.registerForUpdates();
    }
  }

  async ngOnInit() {
    this.loadMenuItems();
    const course = this.getCourseFromPath();
    this.setSelectedMenuItem(course);
  }

  private loadMenuItems() {
    this.appPages = [...this.menuItems.mainMenu];
    this.appPages.push({
      name: 'about',
      title: 'About',
      icon: 'information-circle',
      url: '/about',
    });
  }

  private getCourseFromPath(): string {
    if (window.location.pathname === '/about') {
      return 'about';
    }

    const path = window.location.pathname.split('course/')[1];
    if (path) {
      return path.split('/')[0];
    }
    return '';
  }

  private setSelectedMenuItem(course: string) {
    this.selectedIndex = this.appPages.findIndex(x => x.name === course);
    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
      this.navController.navigateRoot(this.appPages[0].url);
    }
  }

  private styleByMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.setStatusBarStyle(prefersDark.matches);
    prefersDark.addEventListener('change', mediaQuery =>
      this.setStatusBarStyle(mediaQuery.matches),
    );
  }

  private setStatusBarStyle(darkMode: boolean) {
    const { StatusBar } = Plugins;
    StatusBar.setStyle({
      style: darkMode ? StatusBarStyle.Dark : StatusBarStyle.Light,
    });
  }
}
