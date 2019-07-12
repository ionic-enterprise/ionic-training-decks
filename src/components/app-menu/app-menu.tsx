import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'app-menu',
  styleUrl: 'app-menu.scss'
})
export class AppMenu {
  @Prop() menu: any;

  render() {
    return (
      <div>
        <div class="app-menu">
          {this.menu.map(item => <app-menu-item item={item}></app-menu-item>)}
        </div>
      </div>
    );
  }
}
