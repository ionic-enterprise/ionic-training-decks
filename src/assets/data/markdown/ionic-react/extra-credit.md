# Extra Credit

Now that you are through with the course, here are some extra credit exercises you can use to apply what you have learned or to start digging into something new. If there is time at the end of the training days, this can be done "in class." You can also do this on your own if you wish.

## A Better Login Page

The current login page does not offer a very good look and feel. Let's refactor this page for a better user experience. Have a look at the <a href="https://ionicframework.com/docs/api/card" target="_blank">card component</a>. We have used these elsewhere. Let's also use one here.

- Place a card in the page's context.
- Place the full login form inside a card.
- Update the "Title." Perhaps you have a <a href="https://ionicframework.com/docs/api/card-title" target="_blank">card title</a> now?
- Remove the existing header and footer.
- Style the card such that it does not get too wide with any given page size.

**Hints:**

- Use a media query to determine the current page size.
- Set the left and right margins to a reasonable percent so the card is wide enough without being too wide.
- Set the top margin such that the card is towards to top of the page.
- See below for some sample CSS. This is just <a href="https://ionicframework.com/docs/api/grid#default-breakpoints" target="_blank">one breakpoint of many</a>. Figure out good X, Y, and Z values for each.

```css
@media (min-width: 0px) {
  ion-card {
    margin-top: X%;
    margin-left: Y%;
    margin-right: Z%;
  }
}
```

## Tasting Notes Removal Improvements

The Tasting Notes feature that we added was fairly complete, but some shortcuts were made in order to fit in in "on schedule." Let's remove some of that technical debt was accrued.

### Unit Testing

There are no tests for the removal of the tasting notes. Here is your chance to really practice crafting your own tests. Fully test the removal like you would if we followed TDD while writing that section of code.

### Ask Before Removing

Right now, if the user clicks to remove a tasting note, it is simply removed. There is no double check. A lot of our users have complained about this since they will accidentally swipe and click.

**Gaol:** Use an <a href="https://ionicframework.com/docs/api/alert" target="_blank">alert</a> to ask the user if they would like to delete the note, and then respond accordingly. Be sure to fully test this change and follow TDD as you develop the solution.

## Conclusion

That is it! Check your solutions against what we did by having a look at what we did <a href="https://github.com/ionic-enterprise/tea-taster-react" target="_blank">in our code</a>.
