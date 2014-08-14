// Special Wish Actions

// Navigation wishes
genie({
  magicWords: 'Go Home',
  action: './'
});

genie({
  magicWords: 'Google in a new tab',
  action: {
    openNewTab: true,
    destination: 'http://google.com'
  }
});

console.log('This is something you\'ll have to try using the lamp. Rub the lamp and execute these wishes.');