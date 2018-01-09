import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'app-menu-item',
  styleUrl: 'app-menu-item.scss'
})
export class AppMenuItem {
  @Prop() lab: string;
  @Prop() item: any;

  render() {
    return (
      <li>
        <stencil-route-link url={`/lab/${this.lab}/${this.item.id}`}>
          {this.item.title}
        </stencil-route-link>
        {this.item.pages &&
          this.item.pages.length && (
            <app-menu lab={this.lab} menu={this.item.pages} />
            // <ul>
            //   {this.item.pages.map(item => (
            //     <app-menu-item lab={this.lab} item={item} />
            //   ))}
            // </ul>
          )}
      </li>
    );
  }
}
