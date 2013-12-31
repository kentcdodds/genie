#0.3.0

 - Breaking changes: Changed how wishes are registered. Now you
 can only register with objects and arrays of objects. You can't
 register by parameters. There were just too many parameters,
 and everyone using this was using objects/arrays anyway.
 - Genie now adds a `data` property to all wishes with a
 `timesMade` property indicating how many times that wish had
 been made (how many times the action was called).
 - Added getWishes(context)
 - Added getWish(id)
 - Seriously documented some functions.
 - Adding jshint to the build. Some errors corrected.
 - Old tests fixed/removed
 - Updated README accordingly

#0.2.5

 - Big improvement to context. Added complex context functionality
 allowing for more fine control over what wishes are in context and
 which are not. 

#0.2.4

 - Bug fix: if a wish is deregistered, it is removed from the entered
 magic words, but the entry in the entered magic words remained even
 if it was empty.

#0.2.3

 - Added the pathContext feature
 - Added some internal helpers
 - Added this changelog file :)