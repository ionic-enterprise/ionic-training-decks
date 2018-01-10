import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'app-menu-item',
  styleUrl: 'app-menu-item.scss'
})
export class AppMenuItem {
  @Prop() item: any;

  render() {
    return (
      <li>
        <stencil-route-link url={`/${this.item.id}`}>
          {this.item.title}
        </stencil-route-link>
        {this.item.pages &&
          this.item.pages.length && <app-menu menu={this.item.pages} />}
      </li>
    );
  }
}
