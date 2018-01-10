# Renaming the Pages in the Code

At this point, there is a disconnect between the name of our pages in the code and the function that is targetted for each page. Let's fix that. This is basically a brute force operation.

For the items being renamed, be sure to rename all files within the folder and modify any class names, etc. to make sense.

- `src/pages/about` -> `src/pages/passes`
- `src/pages/contacts` -> `src/pages/astronauts`
- `src/pages/home` -> `src/pages/map`
- `src/pages/tab/tabs.ts` - change references
- `src/app/app.module.ts` - change references
