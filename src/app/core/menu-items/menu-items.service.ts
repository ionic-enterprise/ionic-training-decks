import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MenuItem } from '@app/models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuItemsService {
  private items: MenuItem[];

  constructor(private http: HttpClient) {}

  get mainMenu(): {
    name: string;
    title: string;
    icon: string;
    url: string;
  }[] {
    return this.items.map((item) => ({
      name: item.name,
      title: item.title,
      icon: item.icon || 'reader',
      url: this.redirectUrl(item.name),
    }));
  }

  async courses(): Promise<MenuItem[]> {
    return this.items;
  }

  async load(): Promise<void> {
    const res = await firstValueFrom(this.http.get('assets/data/menu.json'));
    this.items = (res as unknown as { pages: MenuItem[] }).pages;
  }

  folder(courseName: string, tabName?: string, pageIndex?: number): string {
    let page = this.page(courseName, tabName, pageIndex);
    if (page && !page.folder) {
      page = this.page(courseName, tabName);
    }
    if (page && !page.folder) {
      page = this.page(courseName);
    }

    return page && page.folder;
  }

  page(courseName: string, tabName?: string, pageIndex?: number): MenuItem {
    let page = this.items.find((x) => x.name === courseName);
    if (page && tabName) {
      page = page.tabs && page.tabs.find((x) => x.name === tabName);
    }
    if (page && (pageIndex || pageIndex === 0)) {
      page = page.pages && page.pages[pageIndex];
    }
    return page;
  }

  url(courseName: string, tabName?: string, page?: number): string {
    let path = '';
    if (courseName) {
      path += `/course/${courseName}`;
      if (tabName) {
        path += `/tabs/${tabName}`;
      }
      if (page || page === 0) {
        path += `/page/${page}`;
      }
    }

    return path;
  }

  redirectUrl(courseName: string, tabName?: string): string {
    let path = '';
    const course = this.items.find((x) => x.name === courseName);
    const tab =
      course &&
      ((course.tabs && course.tabs.find((x) => x.name === tabName)) || (!course.file && course.tabs && course.tabs[0]));

    if (course) {
      path += `/course/${course.name}`;
      if (tab) {
        path += `/tabs/${tab.name}`;
        if (!tab.file && tab.pages && tab.pages.length) {
          path += '/page/0';
        }
      } else {
        if (!course.file && course.pages && course.pages.length) {
          path += '/page/0';
        }
      }
    }
    return path;
  }
}
