# toolslide.js
Minimalistic customizable slide panel (without jQuery)

## Table of contents

- [Quick start](#quick-start)
- [Usage](#usage)
- [Examples](#examples)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [Browser support](#browser-support)
- [Copyright and license](#copyright-and-license)

## Quick start
Several quick start options are available:
#### Download the latest build

###### Development
 * [toolslide.js](https://raw.githubusercontent.com/karenpommeroy/toolslide.js/master/dist/js/toolslide.js)
 * [toolslide.css](https://raw.githubusercontent.com/karenpommeroy/toolslide.js/master/dist/css/toolslide.css)

###### Production
 * [toolslide.min.js](https://raw.githubusercontent.com/karenpommeroy/toolslide.js/master/dist/js/toolslide.min.js)
 * [toolslide.min.css](https://raw.githubusercontent.com/karenpommeroy/toolslide.js/master/dist/css/toolslide.min.css)

#### Install From Bower
```sh
bower install toolslide.js --save
```

#### Install From Npm
```sh
npm install toolslide.js --save
```

Done!

## Usage
#### Including files:

```html
<link rel="stylesheet" href="/path/to/toolslide.css">
<script src="/path/to/toolslide.js"></script>
```

#### Required HTML structure

```html
<div id="toolslide" class="toolslide">
		<div class="ts-nav-container">
			<div class="ts-nav-item" ts-target="first">
			</div>
			<!-- Add more navigation buttons here -->
		</div>
		<div class="ts-content-container">
			<div id="first" class="ts-content-item">
				<div class="example-panel">
					<span>First panel content goes here</span>
				</div>
			</div>
			<!-- Add more content panels here -->
		</div>
	</div>
```

#### Initialization
All you need to do is invoke toolslide on an element:
```javascript
toolslide("#elementId", options);
```
You can also initialize with css selector string:

```javascript
toolslide("#elementId", options);
```

## Examples
There are some example usages that you can look at to get started. They can be found in the [examples folder](https://github.com/karenpommeroy/toolslide.js/tree/master/examples).

 * [Panel on the left](https://rawgit.com/karenpommeroy/toolslide.js/master/examples/example-left.html)
 * [Panel on the right](https://rawgit.com/karenpommeroy/toolslide.js/master/examples/example-right.html)
 * [Panel at the top](https://rawgit.com/karenpommeroy/toolslide.js/master/examples/example-top.html)

## Options
`toolslide.js` can accept an options object to alter the way it looks and behaves.
If no options object is passed default values are used.
The structure of an options object is as follows:

```
{
  position: left",
  height: "100%",
  width: "300px",
  startOpen: true,
  closeable: true,
  animations: {
	replace: "crossfade 0.5s ease-in-out",
    toggle: "slide 0.5s ease",
  },
  listeners: {
	open: function(panel) {},
    close: function(panel) {},
    toggle: function(oldContent, newContent) {}
  }
```

Here is the explanation of options object:

Option     | Type    | Description                         | Examples
-----------| ------- | ----------------------------------- | -----------
position   | string  | Position of the panel on the screen | "top", "bottom", "left", "right"
height     | string  | Panel height                        | "200px", "20%"
width      | string  | Panel width                         | "200px", "20%"
startOpen  | boolean | Open panel after initialization     |
closeable  | boolean | Allow panel to be closed            |
animations.replace   | string  | Animation used when changing active panel | "crossfade 0.5s ease-in-out", "slide 1s ease", "slidefade 2s ease-in-out"
animations.toggle   | string  | Animation used when panel is opened/closed | "slide 0.5s ease"
listeners.open | function | Callback fired when panel is opened | function (panel) {...}
listeners.close | function | Callback fired when panel is closed | function (panel) {...}
listeners.toggle | function | Callback fired when active content is changed | function (old, new) {...}

## Methods
Methods are called on slidePanel instances through the slidePanel method itself.
You can also save the instances to variable for further use.


#### open()
Show the slide panel.
```javascript
toolslide.open();
```

#### close()
Hide the slide panel.
```javascript
toolslide.close();
```

#### close()
Check if panel is opened.
```javascript
toolslide.isOpen();
```


## Events
`toolslide.js` provides custom events for some of it's actions. Appropriate callbacks can be specified in options. 


Event       | Description | Arguments
----------- | ----------- | -----------
open    | Fires when panel is opened.           | panelElement
close   | Fires when panel is closed.           | panelElement
toggle  | Fires when active content is changed. | oldContentElement, newContentElement



## Copyright and license

Licensed under [MIT license](LICENSE).

[^ back to top](#table-of-contents)
