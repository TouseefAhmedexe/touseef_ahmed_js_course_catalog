# Training Course Catalog

A course catalog page that loads its data from JSON files with fetch, built with HTML, CSS and
JavaScript modules. Task 13 of my Bloomrix internship. No jQuery and no framework are used.
All course, lesson and instructor data is sample data.

## Files
- index.html - the page
- style.css - all the styling
- data/ - courses.json, lessons.json and instructors.json
- js/api.js - fetch functions only (no DOM)
- js/data-utils.js - cleaning, filtering, sorting, grouping and counting (pure functions)
- js/url-state.js - reads and writes the search, category, level and sort in the address
- js/debounce.js - a default export used by the search box
- js/ui.js - builds and updates the page (no fetch)
- js/app.js - the entry point that connects the modules

## How it works
- The three JSON files are loaded together with Promise.all.
- Each record is checked before it is used. Unusable records are skipped, and the page says
  how many.
- Loading, empty, error and cancelled states each have a message and a button.
- Search (debounced 300 ms), category, level and sort work together on the loaded data.
- The choices are saved in the address with URLSearchParams and history.replaceState, so a
  link restores them. Invalid values in the address fall back to the defaults.
- AbortController is used for the loading request: a Cancel button, an 8 second timeout, and
  a new load cancels the one that is still running.

## How to run
Open the folder in Visual Studio Code and use Live Server. Modules and fetch do not work when
index.html is opened by double-clicking it.