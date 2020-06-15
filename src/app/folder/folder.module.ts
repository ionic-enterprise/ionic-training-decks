import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';

import { FolderPage } from './folder.page';
import { MarkdownViewModule } from '@app/markdown-view/markdown-view.module';
import { PageMenuModule } from '@app/page-menu/page-menu.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule,
    MarkdownViewModule,
    PageMenuModule,
  ],
  declarations: [FolderPage],
})
export class FolderPageModule {}
