import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-page-menu',
  templateUrl: './page-menu.component.html',
  styleUrls: ['./page-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class PageMenuComponent {
  @Input() menuItems: Array<string>;

  constructor(public popoverController: PopoverController) {}
}
