import { Component, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'app-menu-item',
  styleUrl: 'app-menu-item.scss'
})
export class AppMenuItem {
  @Prop()
  item: any;

  @State()
  expand: boolean;

  componentWillLoad() {
    this.expand = true;
  }

  render() {
    return (
      <div class="app-menu-item">
        <stencil-route-link url={`/${this.item.id}`}>
          {this.item.pages &&
            this.item.pages.length &&
            ((this.expand && (
              <span
                class="fa fa-caret-down"
                onClick={() => (this.expand = false)}
              />
            )) || (
              <span
                class="fa fa-caret-right"
                onClick={() => (this.expand = true)}
              />
            ))}
          {this.item.title}
        </stencil-route-link>
        {this.expand &&
          this.item.pages &&
          this.item.pages.length && <app-menu menu={this.item.pages} />}
      </div>
    );
  }
}
