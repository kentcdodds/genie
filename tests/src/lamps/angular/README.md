# uxGenie

Directive for [GenieJS](http://www.github.com/kentcdodds/genie)

[Demo](http://kentcdodds.github.com/genie)

## Vernacular

See the original genie [vernacular documentation](https://github.com/kentcdodds/genie#vernacular). Words specific to this directive:

 - Lamp: The home of Genie. In Arabian folklore, the genie is imprisoned in a lamp until summoned by rubbiux the lamp to perform wishes. In a GenieJS context, this is the interface between GenieJS and the user.
 - UX: The `ux-` prefix stands for "User eXperience." This was used in an effort to follow the [Best Practices](https://github.com/angular/angular.js/wiki/Best-Practices) proposed by the AngularJS Team.

## Setup

The directive is called `uxLamp` in a module called `uxGenie`. It is restricted to attributes ([Angular default](http://docs.angularjs.org/guide/directive)). Here is an example of it's use:

### Load Script

GenieJS uses [UMD](https://github.com/umdjs/umd), so you can either require genie and uxGenie, or add script tags:

```html
<script src="./vendor/genie.js"></script>
<script src="./vendor/uxGenie.js"></script>
```

### Add Dependency

```javascript
angular.module('yourApp', ['uxGenie']);
```

## Directives

### ux-lamp

**Short Version**

```html
<div ux-lamp></div>
```

This will provide you will the default lamp functionality and template. The lamp is rubbed with <kbd>Ctrl</kbd> + <kbd>Space</kbd> and it will simply appear/disappear.

**Long Version**

```html
<div 
  ux-lamp
  lamp-visible="genieVisible"
  rub-class="visible"
  rub-shortcut="32"
  rub-modifier="ctrlKey"
  rub-event-type="keypress"
  wish-callback="wishMade(wish)"
  local-storage="genie-<user-id>"
  firebase="http://<firebase-name>.firebaseio.com/genie/<user-id>">
</div>
```

The attributes of interest:

 - `ux-lamp` - The directive itself.
 - `lamp-visible` - A doubly bound variable which controls the visibility of the lamp. (Toggles between `true` and `false` when the lamp is rubbed.)
 - `rub-class` - The class to give the lamp when it should be visible. Useful for CSS transitions. If excluded, the lamp will simply appear/disappear when rubbed.
 - `rub-shortcut` - The character code or character to bind as a shortcut to rub the lamp. Defaults to 32 (<kbd>space</kbd> keyCode).
 - `rub-modifier` - A modifier key to be pressed to rub the lamp (ie `ctrlKey`, `metaKey`, `shiftKey`, `altKey`). Defaults to `ctrlKey`.
 - `rub-event-type` - The type of event to bind the lamp rubbing shortcut to (like `keypress`, `keyup`, or `keydown`).
 - `wish-callback` - A function to call when a wish is made (i.e. the user clicks or presses <kbd>enter</kbd> on a wish). The wish which was made is passed to this as an argument.
 - `local-storage` & `firebase` - These cannot be used together as they perform the same function. Use one or the other. These options persist genie's `enteredMagicWords` to localStorage (if available) or firebase. You must have the `Firebase` global constructor function for firebase to work.

#### data.uxGenie

The text displayed for each wish is either what is contained in the `displayText` property of the wish's `data.uxGenie` property.
If this is null, then it uses the first item in the `magicWords` array of the wish.

An `img` tag will be created and added prior to each wish which has a `data.uxGenie.imgIcon` property (this will be assigned to the `img` tag's `src` property).

An `i` tag will be created and added prior to each wish which has a `data.uxGenie.iIcon` property (this will be assigned to the `i` tag's `class` property).

See below for information about "Sub Context." The `ux-lamp` directive relies of the `data.uxGenie.subContext` property for this.

#### Custom Templates

If the `ux-genie` attribute has a value, then the default template will be overwritten and the children elements you include will be [transcluded](http://docs.angularjs.org/guide/directive#creating-custom-directives_demo_creating-a-directive-that-wraps-other-elements). This allows you to have more control over the template used when genie returns the matched wishes. Here are a few things you'll need to know:

##### `uxLamp` object

As an api to the `ux-lamp` simply assign a variable from your scope to the `ux-lamp` attribute like so: `<div ux-lamp="lamp"><your_template></div>`. The object you give will have the following properties attached to it which you can use in your template:

 - `input`: The model attached to the `lamp-input` field
 - `state`: The current state of the lamp (currently only "userentry" or "subcontext" are possible).
 - `focusedWish`: The wish which currently has focus. This is the one which will be called if the "enter" key is pressed in the `lamp-input` field.
 - `matchingWishes`: An array of all the wishes which match the current `input`

##### `lamp-input` and `lamp-wishes-container`

You must add the class `lamp-input` to the input field in your template which `ux-lamp` will treat as the default input field.

You must add the class `lamp-wishes-container` to the div that will contain the `ng-repeat` for the wishes in your template. The `ng-repeat` div must be an immediate child of the `lamp-wishes-container`.

These requirements are so `ux-lamp` to know how to interact with your template (auto-focus the `lamp-input` and auto-scroll the `lamp-wishes-container`), it needs to know which elements are which.

##### Example

See [the demo](http://kent.doddsfamily.us/genie) for an example of a custom template.

#### Sub Context

Alfred has a feature called "Quick Search" allowing a user to switch context while they're typing. The `ux-lamp`
directive has this ability. By providing a wish with the property `data.uxGenie.subContext` the lamp will temporarily
change context to the value of that property when a wish is made and prevent the lamp from disappearing or when
the user types exactly what the display text for that wish is (or the first magicWord is). One use case for this
is if you want a user to search through a collection of similar items, for example animals, you could have a wish
with the sub context of "search-animals" and register a bunch of wishes with "search-animals" as the context.
When the user selected the "Search Animals" wish, they would then be able to type animal names and those wishes would
at that point be in context and show up.

**Note:** The way this works is the context is completely replaced with whatever is provided as the `subContext` property
which is desireable. It is reverted when 1. The lamp disappears or 2. The user input no longer starts with the sub context's
wish display text.

#### View All Wishes
If the first character typed in the lamp input field is <kbd>'</kbd> (apostrophe), then it is stripped from the input when genie is queried for matching magic words. This is primarily to enable a user to see all the available wishes.

#### Calculator

You can type simple math expressions into genie and they will be evaluated. This does use `eval`, but it goes through a
little scrubbing so it should be safe. It's very simple, but you should be able to use any `Math` functions (that's
sort of how it works) for example, instead of `2^3` you would type `pow(2,3)`. I know that's not optimal. If someone
wants to contribute a better method without adding a ton of weight to this directive that would be cool :)

#### CSS

If you're not using a custom template and simply using the default template instead, then here are the css classes you have available to you:

```css
div.genie-lamp-container {/* */}

input.lamp-input {/* */}

div.lamp-wishes-container {/* */}

div.lamp-wish {/* */}

div.lamp-wish.focused {/* */}

span.wish-icon {/* contains both icon elements */}

img.wish-img-icon {/* */}

i.wish-i-icon {/* */}

span.wish-display-text {/* */}
```


### genie-wish

**Short Version**
```html
<a href="/home" genie-wish="Go Home">Home</a>
```

**Long Version**
```html
<a href="/home"
   genie-wish="Go Home"
   wish-id="go-home-wish-id"
   wish-context="comma separated,wish contexts"
   wish-data="scopeVariable"
   wish-event="click"
   event-modifiers="ctrlKey,altKey,shiftKey,metaKey"
   wish-i-icon="glyphicon glyphicon-envelope"
   wish-img-icon="/home-logo.png">Home</a>
```

The attributes of interest:

 - `genie-wish` - The directive itself. This can be a comma separated list for multiple magic words.
 - `wish-id` - The id of the wish
 - `wish-context` - A comma separated list of contexts
 - `wish-data` - A scope object to be assigned to the wish's data object. This is doubly bound.
 - `wish-event` - The dom event to trigger on the element. Defaults to 'click'.
 - `event-modifiers` - a comma separated list of modifiers to add to the event triggered on the element.
 - `wish-i-icon` - Used to set `data.uxGenie.iIcon` (see the `ux-lamp` directive for what this is used for).
 - `wish-img-icon` - Used to set `data.uxGenie.imgIcon` (see the `ux-lamp` directive for what this is used for).

If for some reason you would rather not have the `genie-wish` attribute be the magic words, you can leave
that attribute empty and the `genie-wish` directive will look for a name, id, or the text of the element
(in that order) and assign the magicWords to that value (split by commas). If none of these have values,
you will get an error.

#### data.uxGenie

This directive uses the following wish `data.uxGenie` items:

 - `element` - This is assigned by the directive. It is the element to perform the action on.
 - `event` - This is assigned by the given `wish-event` or the given `wish-data`'s `data.uxGenie.event` property.
     If neither of those are present, it defaults to 'click'.

## Contributing

I'd love to accept [pull requests](https://github.com/kentcdodds/ux-genie/pulls).
When you clone the repo, make sure to run `bower install` to get the dependencies.
Also, please uglify `uxGenie.js` to `uxGenie.min.js` using [UglifyJS2](https://github.com/mishoo/UglifyJS2)
and this command: `uglifyjs uxGenie.js -o uxGenie.min.js --comments` thanks!

## Issues

If you have a problem with GenieJS please don't hesitate to use GitHub's [issue tracker](https://github.com/kentcdodds/ux-genie/issues)
to report it. I'll do my best to get it resolved as quickly as I can.

## The Future...

... [is as bright as your faith](https://www.lds.org/general-conference/2009/04/be-of-good-cheer?lang=eng).
*And* I plan on adding the following features in the future

 - Make tests... :)
 - Allow custom template for wishes
 - Make a jQuery plugin version of this...? I'd love to see someone else make this if you like :)

## License

The MIT License (MIT)

Copyright (c) 2013 Kent C. Dodds

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/kentcdodds/ux-genie/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
