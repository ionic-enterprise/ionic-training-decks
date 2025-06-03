import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonList, IonItem, IonLabel, PopoverController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-page-menu',
  templateUrl: './page-menu.component.html',
  styleUrls: ['./page-menu.component.scss'],
  imports: [CommonModule, IonList, IonItem, IonLabel],
})
export class PageMenuComponent {
  @Input() menuItems: Array<string>;

  constructor(public popoverController: PopoverController) {}
}
