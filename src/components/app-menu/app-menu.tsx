import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'app-menu',
  styleUrl: 'app-menu.scss'
})
export class AppMenu {
  private items: Array<any> = [];

  @Prop() lab: string;

  async ionViewWillLoad() {
    const file = await fetch(`/assets/data/${this.lab}/menu.json`);
    this.items = JSON.parse(await file.text()).pages;
  }

  render() {
    return (
      <div>
        <ul>{this.items.map(item => <app-menu-item lab={this.lab} item={item}></app-menu-item>)}</ul>
      </div>
    );
  }
}
