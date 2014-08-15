genie.restoreContext(); // set to default context

// Context
function register(magicWords, context) {
  return genie({
    context: context,
    magicWords: magicWords,
    action: function() {}
  });
}

function setAndPrint(newContext) {
  genie.context(newContext);
  var matchingWishes = genie.getMatchingWishes();
  console.log('Wishes in context: ' + genie.context());
  var contexts;
  for (var i = 0; i < matchingWishes.length; i++) {
    contexts = matchingWishes[i].context.any ? matchingWishes[i].context.any.join(', ') : '';
    console.log('  ' + (i + 1) + '. ' + matchingWishes[i].magicWords[0] + ' - ' + contexts);
  }
  console.log();
}

// Simple stuff

// Before setting context, genie.context is default
var wish0 = register('wish0');
var wish1 = register('wish1', 'context1');
var wish2 = register('wish2', ['context1', 'context2']);
var wish3 = register('wish3', 'context3');

setAndPrint();

setAndPrint('context1');

setAndPrint('context2');

setAndPrint('context3');

setAndPrint(['context1', 'context2']);

setAndPrint(['context1', 'context3']);

console.log('Changing wish contexts and adding a few more wishes...\n');

// Complex stuff
wish1.context = {
  any: ['context2', 'context5']
};
wish2.context = {
  none: ['context3', 'context5']
};
wish3.context = {
  all: ['context1', 'context5']
};

var wish4 = register('wish4', {
  all: 'context1',
  any: 'context3'
});

var wish5 = register('wish5', {
  all: 'context1',
  none: 'context5'
});

setAndPrint(['context1', 'context2', 'context3', 'context4']);

setAndPrint(['context5', 'context1']);

setAndPrint(['context2']);

genie.restoreContext(); // resets genie's context to default
setAndPrint();