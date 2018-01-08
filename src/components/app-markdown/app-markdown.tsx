import { Component, Prop, State } from '@stencil/core';

declare var marked: any;

@Component({
  tag: 'app-markdown',
  styleUrl: 'app-markdown.scss'
})
export class AppMarkdown {
  @Prop() path: string;
  @State() markup: any;

  async ionViewWillLoad() {
    const data = await fetch(`${this.path}.md`);
    this.markup = marked(await data.text());
  }

  render() {
    return (
      <div innerHTML={this.markup}></div>
    );
  }
}
