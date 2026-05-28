const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('assets') && !file.includes('.expo')) {
            walk(file, (err, res) => {
              results = results.concat(res);
              next();
            });
          } else {
            next();
          }
        } else {
          if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

walk('c:/beautyfly app/project', (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace theme constants
    content = content.replace(/SageColors/g, 'SageColors');
    content = content.replace(/SageColors/g, 'SageColors');
    content = content.replace(/sageLight/g, 'sageLight');
    content = content.replace(/sageLight/g, 'sageLight');
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  });
});
