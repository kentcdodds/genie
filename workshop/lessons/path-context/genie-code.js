// Path Context

var pathContexts = [
  {
    paths: '/',
    contexts: 'default-context'
  },
  {
    paths: '/home',
    contexts: ['home', 'cool-context']
  },
  {
    paths: '/you-can-have-both-paths-and-regexes',
    regexes: [
      /\/pizza\/(.*?)\/(-\d+|\d+)/gi,
      /\/food\/(.*?)\/(-\d+|\d+)/gi
    ],
    contexts: [
      'the-{{1}}-awesome-thing-with-id-{{2}}',
      'the-{{1}}-pizza-with-id-{{2}}'
    ]
  }
];

genie.addPathContext(pathContexts);

function updatePathAndPrintInfo(path, notice) {
  if (path) {
    console.log('Updating path: ' + path);
    genie.updatePathContext(path);
  }
  console.log('  Current context: ' + genie.context());
  console.log('  Notice that ' + notice + '\n')
}

updatePathAndPrintInfo('/home', 'the context is what the home pathContext specifies\n' +
  '  in addition to what genie\'s context was previously.');

updatePathAndPrintInfo('/', 'the context is what the default pathContext specifies\n' +
  '  and it removed any other pathContexts, but not non-path contexts.');

console.log('Removing home path context');
genie.removePathContext(pathContexts[1]);
updatePathAndPrintInfo('/home', 'the context did not change.');

updatePathAndPrintInfo('/pizza/pepperoni/3902344124', 'genie matched the pizza regex and\n' +
  '  set the context to the matches specified.');
updatePathAndPrintInfo('/food/pizza/34k34023s', 'genie matched the food regex and set\n' +
  '  the context to the matches specified.');