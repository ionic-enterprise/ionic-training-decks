class MenuService {
  private _items: Array<any> = [];
  private _paths: Object = {};

  async loadMenu(): Promise<void> {
    const file = await fetch('/assets/data/menu.json');
    this._items = JSON.parse(await file.text()).pages;
    this.buildPaths(this._items);
  }

  get items(): Array<any> {
    return this._items;
  }

  get paths() {
    return this._paths;
  }

  private buildPaths(items: Array<any>, root: string = '') {
    items.forEach(item => {
      let path = root;
      if (item.folder) {
        path += `${item.folder}/`;
      }
      this._paths[item.id] = `${path}${item.id}.md`;
      if (item.pages && item.pages.length) {
        this.buildPaths(item.pages, path);
      }
    });
  }
}

export default new MenuService();
