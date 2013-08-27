GenieJS
=====
*Genie* |ˈjēnē| (noun): a spirit of Arabian folklore, as traditionally depicted imprisoned
within a bottle or oil lamp, and capable of granting wishes when summoned.

Watered Down Explanation
--
GenieJS is a simple library to emulate the same kind of behavior seen in apps like
[Alfred](http://www.alfredapp.com/). Essentially, you register actions associated with
keywords. Then you can request the genie to perform that action based on the best keyword
match for a given keyword.

Over time, the genie will learn the actions more associated with specific keywords and
those will be come first when a list of matching actions is requested. If that didn't
make sense, don't worry, hopefully the tutorial, tests, and demo will help explain how
it works.

Vernacular
--
*Wish*: An object with an id, action, and magic words.

*Action*: What to call when this wish is to be executed.

*Magic Word*: Keywords for a wish used to match it with given magic words.

*King of the Hill*: The wish which gets preference for a certain magic word until another
wish gets made with that magic word twice in a row.

How to use it
--
Include the regular script tag:

```html
<script src="./vendor/genie.js"></script>
```

This will place `genie` on the global namespace for your delight. `genie` is a
function with a few useful functions as properties of `genie`. The flow of
using GenieJS is simple:

```javascript
/* Register wishes */
// One magic word
var trashWish = genie('Take out the trash', function() {
  console.log('Yes! I love taking out the trash!');
});
// Multiple magic words
var vacuumWish = genie(['Get dust out of the carpet', 'vacuum'], function() {
  console.log('Can NOT wait to get that dust out of that carpet!');
});

/* Get wishes based on magic word matches */
genie.getMatchingWishes('vacuum'); // returns [vacuumWish];
genie.getMatchingWishes('out'); // returns [trashWish, vacuumWish];

// Make wish based on wish object or id of wish object
genie.makeWish(trashWish.id); // logs: 'Yes! I love taking out the trash!'
genie.makeWish(vacuumWish); // logs: 'Can NOT wait to get that dust out of that carpet!'
```

So far it doesn't look too magical, but the true magic comes in the form of genie giving
preference to wishes that were recently chosen with a given keyword. To do this, you need
to provide genie with a magic word to associate the wish with, like so:

```javascript
genie.makeWish(vacuumWish, 'out'); // logs as above
genie.getMatchingWishes('out'); // returns [vacuumWish, trashWish]; <-- Notice difference from above
```

As you'll notice, the order of the two wishes is changed because genie gave preference
to the `vacuumWish` because the last time `makeWish` was called with the the `'out'`
magic word, `vacuumWish` was the wish given.

This behavior simulates apps such as [Alfred](http://www.alfredapp.com/) which is the
goal of this library!

API
--
There are a few internal objects you may want to be aware of:
```javascript
var wishObject = {
  id: 'string',
  data: object,
  keywords: ['string'],
  action: function() { }
};

var enteredMagicWords = {
  'Any Magic Word': ['wishId1', 'wishId2', 'wishId3'],
  'Another magic word': ['wishId1', 'wishId2', 'wishId3']
};
```

You have the following api to use at your discretion:

```javascript
genie(magicWords [string || array | required], action [function | required], data [object | optional], id [string | optional]);
// If no id is provided, one will be auto-generated via the previousId + 1
// Returns the wish object
// You may also register wishes with an object for convenience, like so:
genie({
  id: string | optional,
  data: object | optional,
  action: function | required,
  magicWords: string || [string] | required
});

genie.deregisterWish(id [string || wishObject | required]);
// Removes the wish from the registered wishes and the enteredMagicWords
// Returns the deregisteredWish

genie.clearWishes();
// Clears all wishes and enteredMagicWords

genie.getMatchingWishes(magicWord [string | required]);
/* 
 * Returns an array of wishes which match in order:
 *  1. Most recently made wishes with the given magicWord
 *  2. Following the order of their initial registration
 */

genie.makeWish(id [string || wishObject | required], magicWord [string | optional]);
/* 
 * Executes the given wish's action.
 * If a magicWord is provided, adds the given wish to the enteredMagicWords
 *   to be given preferential treatment of order in the array returned
 *   by the getMatchingWishes method.
 * Returns the wish object.
 */

genie.options({
  wishes: [object | optional],
  previousId: [number | optional],
  enteredMagicWords: [object | optional]
});
/*
 * Allows you to set the attributes of genie and returns the current genie options.
 *  1. wishes: All wishes (wishObject described above) currently registered
 *  2. previousId: The number used to auto-generate wish Ids if an id is not
 *    provided when a wish is registered.
 *  3. enteredMagicWords: All magicWords which have been associated with wishes
 *    to give preferential treatment in the order of wishes returned by getMatchingWishes
 */
```

Contributing
--
I'd love to accept pull requests. Please make sure that any new functionality is fully
tested in /test/genie.html and that all tests pass!

Issues
--
I'd love to accept pull requests. But seriously, if you have a problem with GenieJS
please don't hesitate to use GitHub's issue tracker to report it. I'll do my best to get
it resolved as quickly as I can.

The Future...
--
... is as bright as your faith. *And* I plan on adding the following features in the future

 - Better post-enteredMagicWord-match ordering
 - Any other ideas? Pull request or add an issue

License
--
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