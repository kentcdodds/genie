// Enabling and Disabling

genie({
  magicWords: 'word',
  action: function() {}
});

function printState(notice) {
  console.log('  Genie is ' + (genie.enabled() ? 'enabled' : 'disabled'));
  console.log('  Return on disabled is ' + (genie.returnOnDisabled() ? 'enabled' : 'disabled'));
  var wishes = genie.getMatchingWishes();
  var numberOfWishes = 0;
  var oneWish = false;
  if (wishes) {
    oneWish = wishes.length === 1;
    numberOfWishes = wishes.length;
  } else {
    numberOfWishes = 'unknown';
  }
  console.log('  There ' + (oneWish ? 'is ' : 'are ') + numberOfWishes + ' registered wish' + (oneWish ? '' : 'es') + '.');
  console.log('Notice that ' + notice + '\n');
}

console.log('Initial state:');
printState('there is one wish as expected');

console.log('Disabling return on disabled & disabling genie:');
genie.returnOnDisabled(false);
genie.enabled(false);
printState('getMatchingWishes returned nothing!');

console.log('Attempting to enable return on disabled');
genie.returnOnDisabled(true);
console.log('Attempting to add another wish');
genie({
  magicWords: 'word2',
  action: function() {}
});

printState('both enabling return on disabled failed. getMatchingWishes still returned nothing!');

console.log('Enabling genie:');
genie.enabled(true);
printState('there is 1 wish because genie was disabled when the last wish was registered.\n' +
  'Also that return on disabled is still disabled for the same reason.');

console.log('Enabling return on Disabled and disabling genie');
genie.returnOnDisabled(true);
genie.enabled(false);
printState('getMatchingWishes returned an empty object this time!');

console.log('Enabling genie and adding another wish');
genie.enabled(true);
genie({
  magicWords: 'word2',
  action: function() {}
});
printState('there are now 2 wishes!');