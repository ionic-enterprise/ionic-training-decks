import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import marked from 'marked';

@Component({
  selector: 'app-markdown-view',
  templateUrl: './markdown-view.component.html',
  styleUrls: ['./markdown-view.component.scss'],
})
export class MarkdownViewComponent implements OnInit {
  @Input() folder: string;
  @Input() file: string;

  markup: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadMarkdown();
  }

  private async loadMarkdown() {
    const data = await fetch(`/assets/data/markdown${this.folder ? '/' + this.folder : ''}/${this.file}.md`);
    this.markup = this.sanitizer.bypassSecurityTrustHtml(marked(await data.text()));
  }
}
