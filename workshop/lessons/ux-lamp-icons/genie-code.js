// UX-Genie icons

// Hit ctrl + space and then enter an apostrophe ( ' ) to see all the wishes at once.

function addIconWish(name) {
  genie({
    magicWords: name,
    action: function(wish) {
      console.log(wish.magicWords + ' executed.');
    },
    data: {
      uxGenie: {
        iIcon: 'glyphicon glyphicon-' + name.toLowerCase()
      }
    }
  });
}

addIconWish('Cloud');
addIconWish('Envelope');
addIconWish('User');
addIconWish('Search');
addIconWish('Headphones');
addIconWish('Screenshot');
addIconWish('Flash');
addIconWish('Tower');

function addImageWish(name, imgUrl) {
  genie({
    magicWords: name,
    action: function(wish) {
      console.log(wish.magicWords + ' executed.');
    },
    data: {
      uxGenie: {
        imgIcon: imgUrl
      }
    }
  });
}

addImageWish('Smile', 'black-box/smile-face.png');
addImageWish('Google', 'http://www.iconsdb.com/icons/preview/royal-blue/google-plus-xl.png');
