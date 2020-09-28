import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PagePageRoutingModule } from './page-routing.module';

import { PagePage } from './page.page';
import { MarkdownViewModule } from '@app/markdown-view/markdown-view.module';
import { PageMenuModule } from '@app/page-menu/page-menu.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagePageRoutingModule,
    MarkdownViewModule,
    PageMenuModule,
  ],
  declarations: [PagePage],
})
export class PagePageModule {}
