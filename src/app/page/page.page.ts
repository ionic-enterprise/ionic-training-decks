import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItemsService } from '@app/core';
import { MenuItem } from '@app/models';
import { PopoverController, NavController } from '@ionic/angular';
import { PageMenuComponent } from '@app/page-menu/page-menu.component';

@Component({
  selector: 'app-page',
  templateUrl: './page.page.html',
  styleUrls: ['./page.page.scss'],
})
export class PagePage implements OnInit {
  private sectionParam: string;
  private tabParam: string;
  private section: MenuItem;
  private page: MenuItem;

  disableMenu = true;
  errorMessage: string;
  file: string;
  folder: string;
  next: string;
  prev: string;
  title: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private menuItems: MenuItemsService,
    private navController: NavController,
    private popoverController: PopoverController,
  ) {}

  async ngOnInit() {
    this.sectionParam = this.activatedRoute.snapshot.paramMap.get('section');
    this.tabParam = this.activatedRoute.snapshot.paramMap.get('tabName');
    const pageParam = this.activatedRoute.snapshot.paramMap.get('page');
    const pageIdx = pageParam && parseInt(pageParam, 10);

    this.section = this.menuItems.page(this.sectionParam, this.tabParam);
    this.page = this.menuItems.page(this.sectionParam, this.tabParam, pageIdx);

    if (this.page && this.page.file) {
      this.title = this.page.title;
      this.file = this.page.file;
      this.folder = this.menuItems.folder(
        this.sectionParam,
        this.tabParam,
        pageIdx,
      );
    } else {
      this.title = 'Invalid Page';
      this.errorMessage = 'Page does not exist';
    }

    if (this.section && this.section.pages && this.section.pages.length) {
      const newPage = pageIdx || pageIdx === 0 ? pageIdx + 1 : 0;
      this.next =
        newPage < this.section.pages.length
          ? this.menuItems.url(this.sectionParam, this.tabParam, newPage)
          : undefined;
      if (pageIdx) {
        this.prev = this.menuItems.url(
          this.sectionParam,
          this.tabParam,
          pageIdx - 1,
        );
      }
      this.disableMenu = false;
    }
  }

  async showMenu(evt: Event) {
    const menu = await this.popoverController.create({
      component: PageMenuComponent,
      event: evt,
      componentProps: { menuItems: this.section.pages.map(p => p.title) },
    });
    await menu.present();
    const res = await menu.onWillDismiss();
    if (res.role === 'select') {
      const url = this.menuItems.url(
        this.sectionParam,
        this.tabParam,
        res.data,
      );
      this.navController.navigateRoot(url);
    }
  }
}
