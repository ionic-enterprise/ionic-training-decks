import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItemsService } from '@app/core';
import { MenuItem } from '@app/models';
import { PopoverController, NavController } from '@ionic/angular';
import { PageMenuComponent } from '@app/page-menu/page-menu.component';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss']
})
export class FolderPage implements OnInit {
  private courses: Array<MenuItem>;
  private sectionParam: string;
  private section: MenuItem;
  private page: MenuItem;

  disableMenu = true;
  errorMessage: string;
  file: string;
  folder: string;
  next: Array<string>;
  prev: Array<string>;
  title: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private menuItems: MenuItemsService,
    private navController: NavController,
    private popoverController: PopoverController
  ) {}

  async ngOnInit() {
    this.courses = await this.menuItems.courses();
    this.handleSectionParameter();
    if (this.section) {
      this.handlePageParameter();
    }
  }

  async showMenu(evt: Event) {
    const menu = await this.popoverController.create({
      component: PageMenuComponent,
      event: evt,
      componentProps: { menuItems: this.section.pages.map(p => p.title) }
    });
    await menu.present();
    const res = await menu.onDidDismiss();
    if (res.role === 'select') {
      this.navController.navigateRoot(this.buildRoute(res.data));
    }
  }

  private handleSectionParameter() {
    this.sectionParam = this.activatedRoute.snapshot.paramMap.get('section');
    const idx = parseInt(this.sectionParam, 10);
    if (idx >= this.courses.length || isNaN(idx)) {
      this.errorMessage = 'Section number is invalid';
      return;
    }

    this.section = this.courses[idx];
  }

  private handlePageParameter(): MenuItem {
    const param = this.activatedRoute.snapshot.paramMap.get('page');
    const idx = parseInt(param, 10);
    if (param && (!this.section.pages || idx >= this.section.pages.length || isNaN(idx))) {
      this.errorMessage = 'Page number is invalid';
      return;
    }

    this.page = param ? this.section.pages[idx] : this.section;
    this.folder = this.section.folder;
    this.file = this.page.file;
    this.title = this.page.title;
    this.disableMenu = !this.section.pages || !this.section.pages.length;
    if (!this.disableMenu) {
      if (param) {
        this.prev = this.buildRoute(idx ? idx - 1 : undefined);
      }

      if (isNaN(idx) || idx < this.section.pages.length - 1) {
        this.next = this.buildRoute(isNaN(idx) ? 0 : idx + 1);
      }
    }
  }

  private buildRoute(idx?: number): Array<string> {
    const baseRoute = ['/', 'folder', this.sectionParam];
    if (idx || idx === 0) {
      baseRoute.push(idx.toString());
    }
    return baseRoute;
  }
}
