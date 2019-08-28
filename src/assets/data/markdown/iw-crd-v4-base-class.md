# Lab: Create a Base Generic Class

In this lab you will learn how to:

- Refactor repetitive code into a base class
- Derive other pages from the base class

## Create the Base Class

All three of our main pages:

1. Get data on view
1. Show the same basic loader while loading the data

This seems like a natural "is-a" relationship with the only differences being the type. Modeling that is done most naturally via a generic base class.

_Note:_ this could also be modelled via composition, which may have some advantages as well, especially if any of these methods contain a probability of changing in any given screen in a way that would break the "is-a" relationship. In that case, composition may be a wiser move. For the current case, though, I believe composition is more complex.

The base class will be based on the code for one of the other pages. Either "Current Weather" or "Forecast" makes the most sense because they are almost identical. The UV index page, on the other hand, has some extra code that we do not need. Also note that our tests currently exist in the individual page classes. Let's leave them there.

1. `ionic g class weather-page-base/weather-page-base --skipTests`
1. Make the class generic: `export class WeatherPageBase<T> {`
1. Copy the body of the `CurrentWeatherPage` class to `WeatherPageBase`
1. Fix the syntax errors:
   1. Change the data property (`currentWeather: Weather;`)
      1. The name is too specific, make it more generic, like `data`
      1. The type is too specific, it should be `T`
   1. Fix the constructor
      1. The `IconMapService` is bound in the template and thus not needed here, remove it
      1. The `LoadingController` must be imported
      1. This class will not know which method in `WeatherService` to call, so pass in a method signature instead like this: `private fetch: () => Observable<T>`
   1. Fix the methods - there are a few syntax errors, let's see what you can make of them

## Use the Base Class

Try the base class in one page before implementing it in all of the pages. It makes sense to use the "Current Weather" page since that is where the code was copied from.

1. `import { WeatherPageBase } from '../weather-page-base/weather-page-base';`
1. `export class CurrentWeatherPage extends WeatherPageBase<Weather> {`
1. Remove the `currentWeather` property, and all of the methods other than the constructor.
1. Update the HTML file to use the generic property name (`data`) for the data instead of `currentWeather`
1. `LoadingController`, and `WeatherService` still need to be injected, but no longer should be declared private
1. The constructor needs to call `super()`
   1. Pass down `loadingController`
   1. For the `fetch` parameter, pass down `weather.current`
1. Remove any unused imports.

Hmmm, that gives an interesting error in the console. Now that we are here, let's stop and discuss what we believe may be wrong and discuss why and how to fix it.

## Apply the Change to the Other Pages

Now that this is working, make similar changes to the other pages.

## Conclusion

We learned how to refactor the code into a base class. The end result should be that the code is more maintainable and the following steps will require less work than if we didn't notice this pattern and refactor the code.
