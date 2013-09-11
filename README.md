GenieJS
=====
*Genie* |ˈjēnē| (noun): a spirit of Arabian folklore, as traditionally depicted imprisoned
within a bottle or oil lamp, and capable of granting wishes when summoned.

[Demo](http://kentcdodds.github.io/genie)

[Tests](http://kentcdodds.github.io/genie/test)

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

*On Deck*: The second wish of preference for a certain magic word which will be King of
the Hill if chosen again. 

*King of the Hill*: The wish which gets preference for a certain magic word until the
On Deck wish is chosen again (it then becomes On Deck).

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
  context: 'string',
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
// If no id is provided, one will be auto-generated via the previousId + 1
// Returns the wish object
genie(magicWords [string || array | required], action [function | required], data [object | optional], id [string | optional]);
// You may also register wishes with an object for convenience, like so:
genie({
  id: string | optional,
  data: object | optional,
  context: string | optional,
  action: function | required,
  magicWords: string || [string] | required
});

// Removes the wish from the registered wishes and the enteredMagicWords
// Returns the deregisteredWish
genie.deregisterWish(id [string || wishObject | required]);

// calls options() with default options and returns the old options
genie.reset();

/* 
 * Returns an array of wishes which match in order:
 *  1. Most recently made wishes with the given magicWord
 *  2. Following the order of their initial registration
 */
genie.getMatchingWishes(magicWord [string | required]);

/* 
 * Executes the given wish's action.
 * If a magicWord is provided, adds the given wish to the enteredMagicWords
 *   to be given preferential treatment of order in the array returned
 *   by the getMatchingWishes method.
 * Returns the wish object.
 */
genie.makeWish(id [string || wishObject | required], magicWord [string | optional]);

/*
 * Allows you to set the attributes of genie and returns the current genie options.
 *  1. wishes: All wishes (wishObject described above) currently registered
 *  2. noWishMerge: Instead of adding wishes, replace the current list of wishes with the given list.
 *    More about this below...
 *  3. previousId: The number used to auto-generate wish Ids if an id is not
 *    provided when a wish is registered.
 *  4. enteredMagicWords: All magicWords which have been associated with wishes
 *    to give preferential treatment in the order of wishes returned by getMatchingWishes
 *  5. context: The current context of the genie. See below about how context affects wishes
 *  6. enabled: Control whether genie's functions will actually run
 *  7. returnOnDisabled: If enabled is set to false and this is true, will return an empty
 *    object/array/string to prevent the need to do null/undefined checking wherever genie
 *    is used.
 */
genie.options({
  wishes: object | optional,
  noWishMerge: boolean | optional,
  previousId: number | optional,
  enteredMagicWords: object | optional,
  context: string | optional,
  enabled: boolean | optional,
  returnOnDisabled: boolean | optional
});

// Merges the given wishes with existing wishes. (See Merging Wishes below)
genie.mergeWishes(wishes);

// Sets and returns the current context to newContext if provided
// Also sets an internal variable: _previousContext for the revertContext function
genie.context(newContext [string | optional]);

// Sets and returns the current context to the default context (universe)
genie.restoreContext();

// Sets and returns the current context to the previous context
genie.revertContext();

// Sets and returns the enabled state
genie.enabled(boolean | optional);

// Sets and returns the returnOnDisabled state
genie.returnOnDisabled(boolean | optional);
```

About Matching Priority
--
The wishes returned from `getMatchingWishes` are ordered with the following priority
  1. In order of most recently executed (`makeWish`) with the given magic word
  2. If the given magic word is equal to any magic words of a wish
  3. If the given magic word is contained in any magic words of a wish
  4. If the given magic word is an acronym of any magic words of a wish
  5. If the given magic word matches the order of characters in any magic words of a wish.

Just trust the genie. He knows best. And if you think otherwise,
[let me know](https://github.com/kentcdodds/genie/issues) or (even better)
[contribute](https://github.com/kentcdodds/genie/pulls) :)

About Context
--
Genie has a concept of context that allows you to switch between sets of wishes easily.
Each wish is given the default context which is `universe` unless one is provided when
it is registered. Wishes with the default context will not behave differently when context
of genie changes.

When the current context is the default context, all wishes will behave
as if the context were equal to their own context. So essentially `universe` makes it as
though genie has no notion of contexts at all.

When the context is different than the default, only wishes with an equal context will
behave normally with `getMatchingWishes` and `makeWish`.

Enabling & Disabiling
--
To give you a little more control, you can enable and disable genie globally. All genie
functions go through a check to make sure genie is enabled. If it is enabled, everything
works as expected. If it is disabled, then genie will return an empty object/array/string
depending on what the function you're calling is expecting. This behavior is to prevent
the need to do null/undefined checking everywhere you use `genie` and can be disabled as
well via the returnOnDisabled function.

Merging Wishes
--
To persist the user's experience, you may want to store the result of `genie.options()` in
`localStorage` or even a database associated with the user. Then after you have registered
all the wishes for the user you load the options by calling `genie.options({wishes: usersOptions})`.
The problem with this is that `usersOptions` wont have the actions for wishes, so this would
overwrite the wishes with a bunch that don't have actions.

To prevent this, by default when you call `genie.options` genie will merge the wishes. So
any new wishes provided will either overwrite wishes with the same ID, but preserve the
action of the old version if the new version doesn't have an action already. It will also
preserve wishes which existed before and don't have matching ids.

To completely overwrite the existing wishes, simply pass in `noWishMerge` along with the wishes.

Note: Genie provides direct access to the `mergeWishes` function as well.

UX-Genie
--
There is a [AngularJS](https://www.angularjs.org) directive available for GenieJS. Genie is
awesome, but it's not too useful without a way to interact with it. It is used in the demo for
GenieJS. Feel free to go to that project [here](https://www.github.com/kentcdodds/ux-genie).

Contributing
--
I'd love to accept [pull requests](https://github.com/kentcdodds/genie/pulls). Please make
sure that any new functionality is fully tested in /test/index.html and that all tests pass!

Issues
--
If you have a problem with GenieJS please don't hesitate to use GitHub's
[issue tracker](https://github.com/kentcdodds/genie/issues) to report it. I'll do my best
to get it resolved as quickly as I can.

The Future...
--
... [is as bright as your faith](https://www.lds.org/general-conference/2009/04/be-of-good-cheer?lang=eng).
*And* I plan on adding the following features in the future

 - Finished... Ideas? Pull request or add an issue

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