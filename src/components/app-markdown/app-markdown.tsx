import { Component, h, Prop, State } from '@stencil/core';

declare var marked: any;

@Component({
  tag: 'app-markdown',
  styleUrl: 'app-markdown.scss'
})
export class AppMarkdown {
  @Prop() path: string;
  @State() markup: any;

  componentWillLoad() {
    this.loadMarkdown();
  }

  async componentWillUpdate() {
    await this.loadMarkdown();
  }

  render() {
    return <div innerHTML={this.markup} />;
  }

  private async loadMarkdown() {
    const data = await fetch(this.path);
    this.markup = marked(await data.text());
  }
}
