# Life Recorder

## What is Life Recorder

A Timer use Web APIs to record surrounding sound and visualize the signal to capture a glimpse of your life.

## Deployed Link

[https://liferecorder.herokuapp.com](https://liferecorder.herokuapp.com)

## How to use

Your can use Deployed version, but if you want to run it locally, remember to fill firebase setting in `src/containers/Timer.js` and mongoDB in `models/entry.js` and `models/user.js`.

## using packages/ References

### Using

* Web Audio API: To record audio and analyze in analyzer node.
* query-string: Used to communicate to backend
* react-burger-menu: Burger-menu in react.js
* react-responsive: To implement mobile responsive
* reactjs-popup: Show sign-in popups
* react-switch: Sitch between option
* firebase: Use auth package to implement OAuth sign-in
* react-p5-wrapper: draw background
* Notification: Notify user the end of Pomodoro Timer.
* react-table: Present Data in table format
* moment.js: Process time format
* react-day-picker: Use to pick chart rang(day/week)
* react-infinite-scroller: Use to load cards
* normalize.css: normalize browser difference
* node-sass: Use sass

### Reference

* react-month-picker: Due to it design style is so different to other part in this project, I write an alternative on my own.
* stackoverflow
* MDN
* Google Developers - Web
