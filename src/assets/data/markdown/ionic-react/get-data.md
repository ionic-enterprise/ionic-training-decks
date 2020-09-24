# Lab: Getting Data

In this lab, you will learn how to:

- Tranform the data for consumption by your application

## Overview

We've explored how to create a data service singleton and how to make network requests using the `fetch` API. Let's apply these learnings to retrieve tea data from our data service.

**Note:** These endpoints require authorization. We'll be supplying the signed in user's authorization token as input parameters to any functions making requests to our tea data endpoints. A better practice would be to use an HTTP library that allows the creation of network interceptors, which is out-of-scope for this training.

## Tea Singleton

Our data service has two tea endpoints our data service singleton will call:

- An endpoint that returns the entire list of tea
- An endpoint that returns data for a singular tea item

Create a new file in `src/tea` named `TeaCategories.ts`. Let's create our service class and stub out the methods we need:

```TypeScript
import { Tea } from '../models';

export class TeaCategories {
  async getAll(token: string): Promise<Array<Tea>> {
    return Promise.resolve([]);
  }

  async get(id: number, token: string): Promise<Tea | undefined> {
    return Promise.resolve(undefined);
  }
}
```

**Challenge:** Implement a singleton named `TeaCategoriesSingleton`. It should be the default export of this file.

Once complete, create the accompanying test file `src/tea/TeaCategories.test.ts` and paste in the following code:

```TypeScript
import TeaCategories, { TeaCategories } from './TeaCategories';

describe('TeaCategories', () => {
  let teaCategories: TeaCategories;

  beforeEach(() => {
    teaCategories = TeaCategories.getInstance();
    (window.fetch as any) = jest.fn();
  });

  it('should use the singleton instance', () => {
    expect(teaCategories).toBeDefined();
  });

  afterEach(() =>  (window.fetch as any).mockRestore());
});
```

## Getting the Data

### Initialize the Test Data

We are going to need some test data that represents a successful response back from the endpoint. For our application, the data we get back looks like the test data we provided for the page, only it does not have an image associated with it. Let's initalize an array of `Tea` called `expectedTeas` using that data.

Then, we can use `expectedTeas` to manufacture a set of `resultTeas` by deleting the `image` property. `resultTeas` will be the result of our API call. Place this code above the main describe block:

```TypeScript
...
const mockToken = '3884915llf950';
const expectedTeas = [
  {
    id: 1,
    name: 'Green',
    image: 'green.jpg',
    description: 'Green tea description.',
  },
  {
    id: 2,
    name: 'Black',
    image: 'black.jpg',
    description: 'Black tea description.',
  },
  {
    id: 3,
    name: 'Herbal',
    image: 'herbal.jpg',
    description: 'Herbal Infusion description.',
  },
  {
    id: 4,
    name: 'Oolong',
    image: 'oolong.jpg',
    description: 'Oolong tea description.',
  },
  {
    id: 5,
    name: 'Dark',
    image: 'dark.jpg',
    description: 'Dark tea description.',
  },
  {
    id: 6,
    name: 'Puer',
    image: 'puer.jpg',
    description: 'Puer tea description.',
  },
  {
    id: 7,
    name: 'White',
    image: 'white.jpg',
    description: 'White tea description.',
  },
  {
    id: 8,
    name: 'Yellow',
    image: 'yellow.jpg',
    description: 'Yellow tea description.',
  },
];

const resultTeas = () => {
  return expectedTeas.map((t: Tea) => {
    const tea = { ...t };
    delete tea.image;
    return tea;
  });
};
...
```

### Get All Tea Categories

Create a describe block for the "get all" functionality, we'll place some setup logic for our tests in there:

```TypeScript
  ...
  describe('get all', () => {
    beforeEach(() => {
      (window.fetch as any) = jest.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve(resultTeas()),
        });
      });
    });
  });
  ...
```

#### Test First

First, let's setup a test asserting that `getAll()` makes a network request to our endpoint:

```TypeScript
    ...
     it('gets the tea categories', async () => {
      await teaCategories.getAll(mockToken);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
    ...
```

Let's quickly write the minimal code needed to make that test pass in `TeaCategories.ts`:

```TypeScript
  ...
  async getAll(): Promise<Array<Tea>> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    const response = await fetch(url);
    return await response.json();
  }
  ...
```

The backend team has not _quite_ figured out how they want to supply pictures yet, so we'll just hook them up based on `id` for now.

We have already defined what the API result set looks like and what we expect our list of tea categories to look like; let's write a test to ensure that `getAll()` will add images to each tea category item.

Add the following test to the `get all` describe block in `TeaCategories.test.ts`:

```TypeScript
    ...
    it('adds an image to each tea category', async () => {
      const teas = await teaCategories.getAll(mockToken);
      expect(teas).toEqual(expectedTeas);
    });
    ...
```

#### Then Code

In our `TeaCategories` class, we can define an array of images:

```TypeScript
import { Tea } from '../models';

export class TeaCategories {
  private images: Array<string> = [
    'green',
    'black',
    'herbal',
    'oolong',
    'dark',
    'puer',
    'white',
    'yellow',
  ];
  ...
}
...
```

Then, we can use the Array `map` operator to add the missing `image` field and return the expected data set:

```TypeScript
  ...
  async getAll(token: string): Promise<Array<Tea>> {
    const headers = { Authorization: 'Bearer ' + token };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    const response = await fetch(url, { headers });
    const body = await response.json();
    return body.map((tea: Tea) => ({
      ...tea,
      image: require(`../assets/images/${this.images[tea.id - 1]}.jpg`),
    }));
  }
  ...
```

Your tests should now pass.

### Get a Single Tea Category

#### Test First

Start by adding a new describe block with setup code and tests to `TeaCategories.test.ts`:

```TypeScript
  ...
  describe('get one', () => {
    beforeEach(() => {
      (window.fetch as any) = jest.fn(() => {
        return Promise.resolve({
          json: () => Promise.resolve(resultTeas()[3]),
        });
      });
    });

    it('gets the specific tea category', async () => {
      await teaCategories.get(4, mockToken);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });

    it('adds an image to the category', async () => {
      const tea = await teaCategories.get(4, mockToken);
      expect(tea).toEqual(expectedTeas[3]);
    });
  });
  ...
```

#### Then Code

**Challenge:** Implement the `get()` method. The URL will be as follows:

```TypeScript
const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
```

### Refactor

The code that you have for each method probably looks pretty similar to each other:

```TypeScript
  ...
  async getAll(token: string): Promise<Array<Tea>> {
    const headers = { Authorization: 'Bearer ' + token };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    const response = await fetch(url, { headers });
    const body = await response.json();
    return body.map((tea: Tea) => ({
      ...tea,
      image: require(`../assets/images/${this.images[tea.id - 1]}.jpg`),
    }));
  }

  async get(id: number, token: string): Promise<Tea | undefined> {
    const headers = { Authorization: 'Bearer ' + token };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
    const response = await fetch(url, { headers });
    const tea = await response.json();
    return {
      ...tea,
      image: require(`../assets/images/${this.images[tea.id - 1]}.jpg`),
    };
  }
  ...
```

Let's refactor our class to extract the common pieces out:

```TypeScript
  ...
  async getAll(token: string): Promise<Array<Tea>> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    const body = await this.request(url, token);
    return body.map((item: any) => this.fromJsonToTea(item));
  }

  async get(id: number, token: string): Promise<Tea | undefined> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
    const body = await this.request(url, token);
    return this.fromJsonToTea(body);
  }

  private async request(url: string, token: string): Promise<any> {
    const headers = { Authorization: 'Bearer ' + token };
    const response = await fetch(url, { headers });
    return await response.json();
  }

  private fromJsonToTea(obj: any): Tea {
    return {
      ...obj,
      image: require(`../assets/images/${this.images[obj.id - 1]}.jpg`),
    };
  }
  ...
```

That looks much better! Make sure your tests are still passing.

## Conclusion

You have created a singleton to get the tea data from the data service and convert it into the model used within the application. Next, we will wire up the tea page to use this data.
