// UX-Genie sub context

genie.context('app');

genie({
  magicWords: 'Search Posts:',
  context: 'app',
  data: {
    uxGenie: {
      subContext: 'posts'
    }
  }
});

function addPost(name) {
  genie({
    magicWords: name,
    context: 'posts',
    action: function(wish) {
      console.log('Going to the "' + wish.magicWords + '" post...');
    }
  });
}

addPost('How to code');
addPost('Why is AngularJS awesome?');
addPost('Had a great day today!');
addPost('Christmas Eve at the Grandparents');

// Type "Search" then hit enter or tab, you're now in a sub context. Now start typing.