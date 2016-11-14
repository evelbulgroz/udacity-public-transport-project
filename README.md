# Public Transit App Project

This app was developed as an educational project for my Sr. Frontend Web Developer Degree at Udacity in 2016. 

The app allows you to search for journeys on and across the city, suburban, and national/regional railways of Denmark. You can also see arrival and departure listings at stations of your choice.

We're a tiny country, so individual networks don't have separate travel planning services. Instead, the various transit agencies jointly provide the Rejseplanen.dk API that I'm using here.

## Formal Training Objectives
The Udacity assignment for this project was to learn about local storage and caching for "offline first/progressive" web apps. Plus Promises.

## Personal Training Objectives
In addition, I had two major training objectives myself:

1. Learn how to develop and deploy Web apps with Angular2, Typescript and Polymer Elements

2. Experiment with a loosely coupled, "classic" object-oriented technical design, even at the potential cost of somewhat reduced performance on older mobile devices

For an overview of the design, please see the visual models in design/system-design.

## Installation
### Setup
Download or clone the project from my github, then run `npm run setup` in NodeJS from the root directory. Then run `npm run build` from a Linux savvy terminal to get a build of the project (see also "Build" below).

### Online Host
To get started, build the app, move the build to an external Web server, run `npm run proxy` in NodeJS, then load the file `build/index.html` into a web browser (from the Web server) and enter your journey details when the app has loaded.

### Local Host
If you do not have a access to an external Web server, you can run the app locally on your machine by running `npm run start` in NodeJS after setting up and building the project. This will load the development version of the app into your default Web browser. Replace `/src/` with `/build/` at the end of the URL to get the smoothest experience.

## How to Use
Use the top-right "hamburger menu" to navigate between views or, where available, tap an item in a list to see details, and use the top-right "back" (i.e. left) arrow to go back from a detail view to the main list. (Not all lists have detail views.)

Note: In some Web browsers, the app may not work in a private/incognito tab/window.

### Suggested Stations to Search for
I've created the app to be understandable by English speakers. However, the publicly available version of the API I'm using does not provide English translations of the Danish location (station) names it uses.

If you're unfamiliar with our transit network (and why wouldn't you be?), and have an English-variant keyboard layout, here are some station names you can try and type (and search for) without breaking your fingers:
* Skagen
* Horsens
* Valby
* Odense
* Aarhus
* Forum
* Herlev
* Vesterport
* Fredericia
* Fredensborg
* Gilleleje
* Skjern
* Esbjerg
* Ribe

## IDE
I used Visual Studio Code ~1.6.x for this project. Other editors/compilers may work equally well, but I haven't felt the need to try them.  

## Development Server
Enter `npm run start` from the root project directory in NodeJS.

This will start lite server, a CORS proxy server (see below), and the TypeScript compiler in watch mode. It will also open `src/index.html` in your default web browser and connect it up with BrowserSync.

This, however is mostly for your convenience. I used WAMP (a.k.a MAMP, i.e. Apache) myself most of the time during development, so deep links will only work with Apache (they currently all just redirect to the app's base URL.)

To enable offline caching, your server needs to be set up to support https. Mine isn't, so I just tested on my development machine.

## Build
If you just want to give the app a go, a sample build is included in this repository. To create a new build, enter `npm run build` from the root project directory in NodeJS. When done, the app is ready to run from build/index.html.

You'll get a ton of errors saying `The 'this' keyword is equivalent to 'undefined' at the top level of en ES module...`. These can be safely ignored.

Note: Your command terminal for the build script needs to speak Linux. I used Cygwin on my Win box.

Note: If you're not on Windoze, you may experience problems running the build script. At this time, I unfortunately do not have a solution for this, despite my best efforts to avoid platform specific syntax.

## CORS Proxy Required
The Rejseplanen data service provider is not set up to deal with CORS issues, and is very unresponsive to requests for help/guidance and/or changes to their server setup. You'll need to setup up a CORS proxy on your own server to work around this issue.

By default, the app expects an instance of a CORS proxy server to be running at `http://localhost:3000`. This is already included in the "npm start" script.

However, you're free to change this setting in the preferences export from `src/app.module.ts`.

## Unit Testing
Unit tests are run by loading `src/unit-tests.html` in a Web browser.

For this project, I was unfortunately defeated by a black hole of setup conflicts, and therefore had to give up on getting Karma to run on my Win box. So run the tests manually in the browser instead. 

## End-to-End Testing
Couldn't get Protractor to run, nor grok Angular2's approach to UI testing in time for this project's deadline. So no deal, very unfortunately (with a couple of minor exceptions). 

## To-Dos and Known Bugs
(In no particular order.)

### Known Bugs
- Back arrow in top nav does not work on iOS, but the browser's Back button does. Polymer element seems to not register the tap.

### Features/bug fixes/performance improvements
* Add mainfest.json so app can be launched from mobile device's home screen
* Add option to LocalStorage to not check for preexistence before storing when we know db has just been cleared
* Figure out how to navigate back from a child (i.e. detail) view that has been restored to its parent view, then implement for JourneyDetailsComponent
* Revisit use of mixins vs. classical method overloading
* Find a more streamlined way of creating IndexedDB schema
* Add progress indicator to "Find later journeys"
* Add option to fetch earlier journeys to journey planner (not supported by Rejseplanen API) 
* Add trip detail view to arrival/departure boards
* Add date/time picker to arrival/departure boards
* Add location based transit info (e.g. nearby departures/stops)
* Figure out why app refuses to load in some incognito/private modes

### Testing
* Add unit tests for every core model's (inherited) write/readObject methods
* Stop hitting live web services in unit testing; use mock and implement/isolate real test in separate integration test (capture with spy)
* Add unit tests for error message, progress indicator, about and launch components
* Figure out, implement testing of user interaction with UI (i.e. E2E)

## Credits
I initially based this project on the "Tour of Heroes" demo provided by the Angular team, then gradually made it my own. What remains is all on me.  