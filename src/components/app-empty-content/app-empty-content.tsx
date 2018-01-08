import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'app-empty-content',
  styleUrl: 'app-empty-content.scss'
})
export class AppEmptyContent {
  @Prop() filename: string;

  render() {
    return (
      <div>
        <p>this will be an ionic icon or something</p>
      </div>
    );
  }
}
