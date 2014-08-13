# Genie

![Genie logo](other/logo.png)

A JavaScript library committed to improving user experience by empowering users to interact with web apps using the keyboard (better than cryptic shortcuts).

*Genie* |ˈjēnē| (noun): a spirit of Arabian folklore, as traditionally depicted imprisoned
within a bottle or oil lamp, and capable of granting wishes when summoned.

[Demo](http://kent.doddsfamily.us/genie)

[Tests](http://kent.doddsfamily.us/genie/tests/testrunner.html)

[Genie Workshop](http://kent.doddsfamily.us/genie-workshop/) - Terrific way to learn how to use genie right in your browser.

[API Docs](http://kent.doddsfamily.us/genie/autodoc)

[Chrome Extension](https://chrome.google.com/webstore/detail/genies-lamp/pimmaneflgfbknjkjdlnffagpgfeklko)

[![Build Status](https://travis-ci.org/kentcdodds/genie.png)](https://travis-ci.org/kentcdodds/genie)

[![Bower version](https://badge.fury.io/bo/geniejs.png)](http://bower.io/search/?q=genie) `bower install geniejs`

[![NPM version](http://img.shields.io/npm/v/geniejs.svg)](https://www.npmjs.org/package/geniejs) `npm install geniejs`

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

##Watered Down Explanation

GenieJS is a simple library to emulate the same kind of behavior seen in apps like
[Alfred](http://www.alfredapp.com/). Essentially, you register actions associated with
keywords. Then you can request the genie to perform that action based on the best keyword
match for a given keyword.

Over time, the genie will learn the actions more associated with specific keywords and
those will be come first when a list of matching actions is requested. If that didn't
make sense, don't worry, hopefully the tutorial, tests, and demo will help explain how
it works.

##Vernacular

*Wish*: An object with an id, action, and magic words.

*Action*: What to call when this wish is to be executed.

*Magic Word*: Keywords for a wish used to match it with given magic words.

*On Deck*: The second wish of preference for a certain magic word which will be King of
the Hill if chosen again. 

*King of the Hill*: The wish which gets preference for a certain magic word until the
On Deck wish is chosen again (it then becomes On Deck).

##How to use it

If you're using [RequireJS](http://requirejs.org/) then you can simply `require('path/to/genie')`.
Or you could simply include the regular script tag:

```html
<script src="./bower_components/genie.js"></script>
<!-- This will place `genie` on the global namespace for your delight. -->
```

`genie` is a function with a few useful functions as properties of `genie`.
The flow of using GenieJS is simple:

```javascript
/* Register wishes */
// One magic word
var trashWish = genie({
  magicWords: 'Take out the trasn',
  action: function() {
    console.log('Yes! I love taking out the trash!');
  }
});
// Multiple magic words
var vacuumWish = genie({
  magicWords: ['Get dust out of the carpet', 'vacuum'],
  action: function() {
    console.log('Can NOT wait to get that dust out of that carpet!');
  }
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


##API

Genie is undergoing an overhaul on the API documentation using [autodocs](https://github.com/dtao/autodoc).
It is still being worked on, but you can see that documentation
[here](http://kent.doddsfamily.us/genie/autodoc).

Below you can see full documentation. It's just less enjoyable to read...

###Objects

There are a few internal objects you may want to be aware of:

```javascript
var wishObject = {
  id: 'string',
  data: {
    timesMade: {
      total: 0,
      magicWords: {
        "Magic Word": 1
      }
    }
  },
  context: {
    all: ['string'],
    any: ['string'],
    none: ['string']
  },
  keywords: ['string'],
  action: function(wish, magicWord) { }
};

var enteredMagicWords = {
  'h': {
    wishes: ['wishid1', 'wishid2'],
    'e': {
      'l': {
        'l': {
          'o': {
            wishes: ['wishid3', 'wishid4']
          }
        },
        'p': {
          wishes: ['wishid5', 'wishid2']
        }
      }
    }
  }
};

var pathContext = {
  paths: ['string'],
  regexes: [/regex/gi],
  contexts: 'The context to apply'
};
```

You have the following api to use at your discretion:

```javascript
/*
 * If no id is provided, one will be auto-generated via the previousId + 1
 * Genie adds a "timesMade" property to the "data" property
 *   This is incremented every time the wish is made
 *   (when the action is called)
 * You can also provide genie with an array of these objects
 *   to register all of them at once.
 * Returns the wish object.
 */
genie({
  id: string | optional,
  data: object | optional,
  context: string || [string] || {
    all: [string],
    any: [string],
    none: [string]
  } | optional,
  action: function | required,
  magicWords: string || [string] | required
});

/*
 * Removes the wish from the registered wishes and the enteredMagicWords
 * Returns the deregisteredWish
 */
genie.deregisterWish(id [string || wishObject | required]);

/*
 * Removes all wishes which have any of the given context(s).
 */
genie.deregisterWishesWithContext(context [string || array | required]);

/*
 * calls options() with default options and returns the old options
 */
genie.reset();

/* 
 * Returns an array of wishes which match in order:
 *  1. Most recently made wishes with the given magicWord
 *  2. Following the order of their initial registration
 */
genie.getMatchingWishes(magicWord [string | required]);

/*
 * Replace genie's matching algorithm with your own.
 * Gives you three parameters:
 *   - wishes (all genie wishes)
 *   - magicWord (the magicWord to match)
 *   - context (genie's current context)
 *   - enteredMagicWords (genie's current enteredMagicWords object)
 */
genie.overrideMatchingAlgorithm(function(wishes, magicWord, context, enteredMagicWords) {
  // Your matching code.
});

/*
 * Sets the matching algorithm back to genie's default algorithm.
 */
genie.restoreMatchingAlgorithm();

/* 
 * Executes the given wish's action.
 * If a magicWord is provided, adds the given wish to the enteredMagicWords
 *   to be given preferential treatment of order in the array returned
 *   by the getMatchingWishes method.
 * Returns the wish object.
 */
genie.makeWish(id [string || wishObject | required], magicWord [string | optional]);

/*
 * Returns wishes in the given context. This is what would be returned in the
 *   case genie's context were the given context and you called
 *   genie.getMatchingWishes(); (no args).
 * If no context is provided, all wishes are returned.
 * Returns wishes as an array
 */
genie.getWishesInContext(context [string || array | optional]);


/*
 * Get wishes which have {type} of {context} in their context.{wishContextType}
 * type can be: 'any', 'all', or 'none' and refers to the context given
 * wishContextType can be a string or array with: 'any', 'all', or 'none'
 *   and refers to the which of the wish's contexts to search. If not provided
 *   genie combines all three. If a wish doesn't have a context object, but an
 *   array or string instead, it treats that as if it were 'any' (as expected).
 *
 * This is a pretty complicated api, so here are a few examples
 * ex. getWishesWithContext('animal', 'none', 'all')
 *   This would find all wishes which have no don't have the context 'animal' in their 'all'
 *   context property
 * ex. getWishesWithContext('fred')
 *   This would find all wishes which have the context 'fred' in any of their contexts
 *   (including none).
 * ex. getWishesWithContext('tom', 'any', ['all', 'none'])
 *   This would find all wishes which have the context 'tom' in their 'all' or 'none' contexts.
 * ex. getWishesWithContext(['tom', 'fred'], 'all')
 *   This would find all wishes which have both the context 'tom' and 'fred' in any of their contexts.
 * ex. getWishesWithContext(['orange', 'apple'], 'none', 'any')
 *   This would find all wishes which do not have 'orange' or 'apple' in their 'any' context.
 */
genie.getWishesWithContext(context [string || array | required], type [string | optional | 'any'], wishContextTypes) {

/*
 * Get a specific wish by an id.
 * If the id is an array, returns an array
 *   of wishes with the same order as the
 *   given array.
 * Note: If the id does not correspond to
 *   a registered wish, it will be undefined
 */
genie.getWish(id [string || array | required]);
 
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

/*
 * Merges the given wishes with existing wishes. (See Merging Wishes below)
 */
genie.mergeWishes(wishes);

/* 
 * Sets and returns the current context to newContext if provided
 * Also sets an internal variable: _previousContext for the revertContext function
 */
genie.context(newContext [string || array | optional]);

/*
 * Adds the context(s) to genie's current context
 */
genie.addContext(newContext [string || array | optional]);

/* 
 * Removes the context(s) to genie's current context
 */
genie.removeContext(newContext [string || array | optional]);

/* 
 * Sets and returns the current context to the default context: ['universe']
 */
genie.restoreContext();

/* Sets and returns the current context to the previous context
 * The previous context is updated when context, addContext,
 *   removeContext, restoreContext, and revertContext are called.
 */
genie.revertContext();

/* See more about how this works below in the context section
 *   This will update the current context with the given path
 *   noDeregister is used to prevent this from deregistering
 *     wishes which are not in the path's context.
 */
genie.updatePathContext(path, noDeregister);

/*
 * Adds a path context (or array of them) to genie's _pathContext array
 */
genie.addPathContext(pathContext);

/*
 * Removes a path context (or array of them) from genie's _pathContext array
 */
genie.removePathContext(pathContext);

/*
 * Sets and returns the enabled state
 */
genie.enabled(boolean | optional);

/*
 * Sets and returns the returnOnDisabled state
 */
genie.returnOnDisabled(boolean | optional);
```

##Special Wish Actions

There are some actions that are common use cases, so genie helps with these (currently only one
special wish action):

###Navigation

You for the action of the wish you can provide either a string (URL) or an object with a destination
property (URL). If the action is an object this gives you a few options:
 - openNewTab - If truthy, this will open the URL using '_blank'. Otherwise opens in the current window.
 - That's all for now... any [other](https://github.com/kentcdodds/genie/pulls) [ideas?](https://github.com/kentcdodds/genie/issues)

##About Matching Priority

The wishes returned from `getMatchingWishes` are ordered with the following priority
  1. In order of most recently executed (`makeWish`) with the given magic word
  2. If the given magic word is equal to any magic words of a wish
  3. If the given magic word is the start to any magic word of a wish (i.e. 'he' in 'hello');
  4. If the given magic word is the start to any word in a magic word (i.e. 'wo' in 'hello world');
  5. If the given magic word is contained in any magic words of a wish
  6. If the given magic word is an acronym of any magic words of a wish
  7. If the given magic word matches the order of characters in any magic words of a wish.

Just trust the genie. He knows best. And if you think otherwise,
[let me know](https://github.com/kentcdodds/genie/issues) or (even better)
[contribute](https://github.com/kentcdodds/genie/pulls) :)

##About Context

Genie has a concept of context that allows you to switch between sets of wishes easily.
It's a toss up between context and the matching algorithm on which is more complex but
hopefully I can explain it well enough for you! Each wish is given the default context
which is `universe` unless one is provided when it is registered. Wishes will only
behave normally in `getMatchingWishes` and `makeWish` when they are in context.

The easiest way to think of a wish context is that it is structured like so:

```javascript
{
  all: ['context1', 'context2'],
  any: ['context3', 'context4'],
  none: ['context5', 'context6']
}
```

If you set a wish's context to a string or array of strings, it behaves like so:

```javascript
// what you set:
var wish = genie({
  context: ['context1', 'context2']
});

console.log(wish.context); // logs {any: ['context', 'context2']}
```

There are a few ways for a wish to **definitely** be in context:
 1. Genie's current context is the default context
 2. The wish's context is the default context (does not apply if it simply contains the default context)
 3. The wish's context is equal to the current context

If none of these are true, then these things must be true for the wish to be in context:
 1. Genie's context does **not** contain any of the wish's `context.none` contexts if it exists.
 2. Genie's context contains **at least one** of the wish's `context.any` contexts if it exists.
 3. Genie's context contains **all** of the wish's `context.all` contexts if it exists. 

Checkout [the tests](test/tests.js) for #context to see more how this works. Here's a simple demonstration:

```javascript
// Simple stuff

// Before setting context, genie.context is default
wish0.context // returns the default context
wish1.context = 'context1';
wish2.context = ['context1', 'context2'];
wish3.context = 'context3';

genie.getMatchingWishes(); // returns [wish0, wish1, wish2, wish3]

genie.context('context1');
genie.getMatchingWishes(); // returns [wish0, wish1, wish2]

genie.context('context2');
genie.getMatchingWishes(); // returns [wish0, wish2]

genie.context('context3');
genie.getMatchingWishes(); // returns [wish0, wish3]

genie.context(['context1', 'context2']);
genie.getMatchingWishes(); // returns [wish0, wish1, wish2]

genie.context(['context1', 'context3']);
genie.getMatchingWishes(); // returns [wish0, wish1, wish2, wish3]
```

```javascript
// Complex stuff

genie.context = ['context1', 'context2', 'context3', 'context4'];

wish0.context // returns the default context
wish1.context = {
  any: ['context2', 'context5']
};
wish2.context = {
  none: ['context3', 'context5']
};
wish3.context = {
  all: ['context1', 'context5']
};

genie.getMatchingWishes(); // returns [wish0, wish1]

genie.context(['context5', 'context1']);
genie.getMatchingWishes(); // returns [wish0, wish1, wish3]

genie.context(['context2']);
genie.getMatchingWishes(); // returns [wish0, wish1, wish2]

genie.restoreContext(); // resets genie's context to default
genie.getMatchingWishes(); // returns [wish0, wish2]
```

###Path Context

A big use case for context is to have a url path (or route) represent the context for genie. For example,
if you have an email app, you can have the `/index` and the `/message/:id` routes which would have
different contexts. Instead of managing this yourself, genie can help you a little. Genie will not watch
the URL for you, so you have to do that yourself. This is by design. At any time, you can call
`genie.updatePathContext(window.location.pathname)` and genie will update the context based on an internal
variable called `_pathContexts`. You have control over what's in this array using the `genie.addPathContext(pathContext)`
and the `genie.removePathContext(pathContext)` methods. A `pathContext` object looks like this:

```javascript
{
  paths: string || array of strings | optional (either this or regexes), 
  regexes: regex || array of regexes | optional (either this or paths),
  contexts: string || array of strings | required
}
```

The `contexts` variable is special and is associated with the regexes variable. The easiest way to describe this
is via an example:

If I have a pathContext object like this:

```javascript
{
  regexes: [
    /\/pizza\/(-\d+|\d+)/gi,
    /\/pizza\/(pepperoni)/gi
  ],
  contexts: 'a-page-{{1}}'
}
```

Then, when I call `genie.updatePathContext('/pizza/1234')` it will match this pathContext and genie will
automatically change `a-page-{{1}}` to `a-page-1234`.

The `1` in `a-page-{{1}}` represents the group that is matched on the path in the regex. It will replace the
digit in `{{\d}}` with the group that's matched (Note: in true JavaScript form, group 0 represents the entire
match string, hence, 1 is the first group in parentheses).

##Enabling & Disabling

To give you a little more control, you can enable and disable genie globally. All genie
functions go through a check to make sure genie is enabled. If it is enabled, everything
works as expected. If it is disabled, then genie will return an empty object/array/string
depending on what the function you're calling is expecting. This behavior is to prevent
the need to do null/undefined checking everywhere you use `genie` and can be disabled as
well via the returnOnDisabled function.

##Merging Wishes

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

##UX-Genie

There is a [AngularJS](https://www.angularjs.org) directive available for GenieJS. Genie is
awesome, but it's not too useful without a way to interact with it. It is used in the demo for
GenieJS. Feel free to go to that project [here](https://www.github.com/kentcdodds/ux-genie).

##Contributing

I'd love to accept [pull requests](https://github.com/kentcdodds/genie/pulls). I'm in the middle
of moving all tests to mocha, so please make sure that test the old tests still runs (test/index.html).
Also before you push, make sure to do the following:
 1. Run `grunt bumpup:patch` (or minor, or major as the case may be)
 2. Run `grunt` to build the library (don't push if this fails :))

**Note:** genie has a jshint grunt task which enforces some of the styling we want to be consistent
in the project. Take a look at the configuration for this task to know what those requirements are.

##Issues

If you have a problem with GenieJS please don't hesitate to use GitHub's
[issue tracker](https://github.com/kentcdodds/genie/issues) to report it. I'll do my best
to get it resolved as quickly as I can.

##Special Thanks

To the developers that make software development awesome. Thanks to pull requesters and issue reporters.
And a special thanks to these projects:

 - [NodeJS](http://nodejs.org/)
 - [NPM](https://npmjs.org/)
 - [Bower](http://bower.io/)
 - [GruntJS](http://gruntjs.com/)
 - [Travis-CI](https://travis-ci.org/)
 - [Mocha](http://visionmedia.github.io/mocha/)
 - [Chai](http://chaijs.com/)
 - And of course [GitHub](http://www.github.com)

##License

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


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/kentcdodds/genie/trend.png)](https://bitdeli.com/free "Bitdeli Badge")