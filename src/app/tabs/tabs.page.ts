import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItemsService } from '@app/core';
import { MenuItem } from '@app/models';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  section: MenuItem;

  constructor(
    private route: ActivatedRoute,
    private menuItems: MenuItemsService,
  ) {}

  ngOnInit() {
    const sectionName = this.route.snapshot.paramMap.get('section');
    this.section = this.menuItems.page(sectionName);
  }
}
