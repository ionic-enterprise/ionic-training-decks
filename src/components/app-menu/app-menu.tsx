import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'app-menu',
  styleUrl: 'app-menu.scss'
})
export class AppMenu {
  @Prop() lab: string;
  @Prop() menu: any;

  render() {
    return (
      <div>
        <ul class="app-menu">{this.menu.map(item => <app-menu-item lab={this.lab} item={item}></app-menu-item>)}</ul>
      </div>
    );
  }
}
