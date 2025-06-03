export class MenuItem {
  title: string;
  name?: string;
  file?: string;
  folder?: string;
  icon?: string;
  pages?: MenuItem[];
  tabs?: MenuItem[];

  constructor(data: MenuItem) {
    this.title = data.title;
    this.name = data.name;
    this.file = data.file;
    this.folder = data.folder;
    this.icon = data.icon;
    this.pages = data.pages && JSON.parse(JSON.stringify(data.pages));
    this.tabs = data.tabs && JSON.parse(JSON.stringify(data.tabs));
  }
}
