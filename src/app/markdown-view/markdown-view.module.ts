import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarkdownViewComponent } from './markdown-view.component';

@NgModule({
  declarations: [MarkdownViewComponent],
  exports: [MarkdownViewComponent],
  imports: [CommonModule],
})
export class MarkdownViewModule {}
