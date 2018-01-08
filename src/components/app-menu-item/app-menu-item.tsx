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
        <a href={`/lab/${this.lab}/${this.item.id}`}>{this.item.title}</a>
        {this.item.pages &&
          this.item.pages.length && (
            <ul>
              {this.item.pages.map(item => (
                <app-menu-item lab={this.lab} item={item} />
              ))}
            </ul>
          )}
      </li>
    );
  }
}
