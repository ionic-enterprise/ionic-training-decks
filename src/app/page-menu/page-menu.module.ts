import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PageMenuComponent } from './page-menu.component';

@NgModule({
  declarations: [PageMenuComponent],
  exports: [PageMenuComponent],
  imports: [CommonModule, IonicModule],
})
export class PageMenuModule {}
