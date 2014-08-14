// Making a Wish

// Register simple wish
var trashWish = genie({
  magicWords: 'Take out the trash',
  action: printInfo
});

// Multiple magic words
var vacuumWish = genie({
  magicWords: ['Get dust out of the carpet', 'vacuum'],
  action: printInfo
});

function printInfo(wish, magicWord) {
  var made = wish.data.timesMade;
  console.log('I am the wish with the magic words: "' + wish.magicWords.join('","') + '"');
  console.log('I have already been made with the following words a total of ' + made.total + ' times:');
  for (var word in made.magicWords) {
    console.log(word + ': ' + made.magicWords[word]);
  }
  console.log('Genie will now add "' + magicWord + '" to the words associated for me\n');
}

/*
 * Making wishes
 */
genie.makeWish(trashWish, 'out');
genie.makeWish(trashWish, 'out');
genie.makeWish(trashWish, 'take');
genie.makeWish(vacuumWish, 'ou');
genie.makeWish(vacuumWish, 'ou');
genie.makeWish(vacuumWish, 'ou');
genie.makeWish(vacuumWish, 'vac');
genie.makeWish(vacuumWish, 'vac');
genie.makeWish(vacuumWish, 'vac');