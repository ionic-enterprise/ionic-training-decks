import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-page-menu',
  templateUrl: './page-menu.component.html',
  styleUrls: ['./page-menu.component.scss'],
})
export class PageMenuComponent {
  @Input() menuItems: Array<string>;

  constructor(public popoverController: PopoverController) {}
}
