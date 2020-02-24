import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MenuItem } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class MenuItemsService {
  private items: Array<MenuItem>;
  private ready: Promise<void>;

  constructor(private http: HttpClient) {
    this.ready = this.loadMenu();
  }

  async courses(): Promise<Array<MenuItem>> {
    await this.ready;
    return this.items;
  }

  private async loadMenu(): Promise<void> {
    const res: any = await this.http.get('assets/data/menu.json').toPromise();
    this.items = res.pages;
  }
}
