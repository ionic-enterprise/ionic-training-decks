import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'app-menu-item',
  styleUrl: 'app-menu-item.scss'
})
export class AppMenu {
  @Prop() item: any;

  render() {
    if (this.item.pages && this.item.pages.length) {
      return (
        <li>
          {this.item.title}
          <ul>{this.item.pages.map(item => <app-menu-item item={item}></app-menu-item>)}</ul>
        </li>
      );
    } else {
      return <li>{this.item.title}</li>;
    }
  }
}
