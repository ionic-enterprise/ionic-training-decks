import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MenuItemsService } from '@app/core';
import { MenuItem } from '@app/models';
import { IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [CommonModule, FormsModule, IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon],
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
