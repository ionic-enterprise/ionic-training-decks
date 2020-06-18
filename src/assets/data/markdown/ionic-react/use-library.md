# Lab: Use a Library

In this lab, you will learn how to:

* Install third party libraries
* Integrate the third party libraries into your application
* Maintain the application's dependencies

## Install the Library

It is often useful to use third party libraries. For this application, we will use a library of <a href="https://github.com/kensodemann/kws-weather-widgets" target="_blank">weather related components</a> that I created and published on NPM. Many useful JavaScript libraries are availble via NPM and are available for use in your application.

To install my weather component library, run: `npm install kws-weather-widgets`

The library is installed in `node_modules` and your `package.json` file is updated to reflect the new dependency:

```JSON
    "kws-weather-widgets": "~2.0.2",
```

## Use the Library

Good libraries usually document exactly how to use the library in your application. In the case of this library - which is a web component library built using a technology called <a href="https://stenciljs.com" target="_blank">Stencil</a> - there are some steps that need to be taken to use the library in a React project (like yours).

There is a method in the library called `defineCustomElements()` that needs to be called. This is usually called in the `index.ts` file. This method contains the special sauce that bundlers like WebPack need in order to be aware of the components, with the end result being that WebPack will bundle them properly.

```TypeScript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { defineCustomElements } from 'kws-weather-widgets/loader';

ReactDOM.render(<App />, document.getElementById('root'));
defineCustomElements(window);
```

There are a couple more tricks we will need to employ when using this web component library within a React application, but we will cross that bridge when we come to it.

## Maintaining Dependencies

NPM is also used to maintain the application's dependencies. If you type `npm outdated` from the root directory of your project you can see which dependencies may need upgrading.

You will see something like this, with the actual contents varrying over time.


```
$ npm outdated
Package                  Current    Wanted   Latest  Location
@ionic/react              4.11.2    4.11.7   4.11.7  ionic-weather-react-starter
@ionic/react-router       4.11.2    4.11.7   4.11.7  ionic-weather-react-starter
@testing-library/react     9.3.2     9.3.3    9.4.0  ionic-weather-react-starter
@types/jest              24.0.19   24.0.24  24.0.24  ionic-weather-react-starter
@types/node              12.11.2  12.12.22   13.1.0  ionic-weather-react-starter
@types/react              16.9.9   16.9.17  16.9.17  ionic-weather-react-starter
@types/react-dom          16.9.2    16.9.4   16.9.4  ionic-weather-react-starter
@types/react-router        5.1.2     5.1.3    5.1.3  ionic-weather-react-starter
@types/react-router-dom    5.1.0     5.1.3    5.1.3  ionic-weather-react-starter
react                    16.10.2   16.12.0  16.12.0  ionic-weather-react-starter
react-dom                16.10.2   16.12.0  16.12.0  ionic-weather-react-starter
react-scripts              3.2.0     3.2.0    3.3.0  ionic-weather-react-starter
typescript                 3.6.3     3.6.3    3.7.4  ionic-weather-react-starter
```

The three most important columns here are `Current`, `Wanted`, and `Latest`.

- `Current` is the version that is currently installed
- `Wanted` is the version that can be upgraded to accordion to the rules specified in your `package.json`. This is the version that `npm update` will install.
-  `Latest` is the latest version available

For example have a look at the versions specified above for `@testing-library/react`. An `npm update` will take the version from `9.3.2` to `9.3.3` because the version is specified with a `~` prefix in the `package.json` file. However, the latet version is `9.4.0`. The `9.4.0` version would need to be installed manually.

Some analysis and thouht is required at this point. It is generally best to do the following with your own apps:

1. Create a branch so it is easy to revert if things to wrong
1. Upgrade according to the rules defined in your `package.json` (that is: `npm update`)
1. Test
1. Commit and continue if successful
1. `npm oudated`
1. Individually analyze the other changes
1. Install and test one package (or set of packages) at a time
1. Commit after each successful install so you always have a fall-back point

Let's walk through this process together in class.

**Note:** you might run into a situation where NPM finds various vulnerabilities. Here is what I normally do in that case:

1. upgrade all of my dependencies as much as possible
1. be sure and do a `commit` at this point
1. run `npm audit fix` - often the vulnerability is in a dependency of a dependency and this _can_ fix it
1. if there are still vulnerabilities, analyze the situation

If at the end of all of that, vulnerabilities still exist, you will have to ask yourself the following:

1. is the vulnerability in my application's dependency chain or in the tooling's dependency chain
1. if the vulnerability is in the tooling's dependency chain, I can often just wait until it gets fixed, no big deal
1. if the vulnerability is in the application's dependency chain, now I look at things a bit and ask myself a few questions to determine if it is worth the risk to manually update the dependency, for example:
   1. how serious is it?
   1. how important is it to my application that the vulerability not be there?
   1. how close am I to release?

## Conclusion

In this lab you learned how to include a third party library in your application, how to configure web component libraries that have been built using Stencil, and how to manage your dependencies. Next we will look at mocking up the user interface.

Be sure to commit your changes.
