const googleIt = require('google-it');
googleIt({ query: 'site:linkedin.com/in "react developer"' })
  .then(results => {
    console.log(JSON.stringify(results.slice(0, 2), null, 2));
  })
  .catch(e => console.error(e));
