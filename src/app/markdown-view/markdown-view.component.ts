import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { marked } from 'marked';

@Component({
  selector: 'app-markdown-view',
  templateUrl: './markdown-view.component.html',
  styleUrls: ['./markdown-view.component.scss'],
  standalone: true,
  imports: [CommonModule],
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
    FirebaseAnalytics.logEvent({
      name: 'select_content',
      params: {
        section: this.folder,
        file: this.file,
      },
    });

    const data = await fetch(`/assets/data/markdown${this.folder ? '/' + this.folder : ''}/${this.file}.md`);
    this.markup = this.sanitizer.bypassSecurityTrustHtml(await marked(await data.text()));
  }
}
