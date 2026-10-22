import fs from 'node:fs';
const files=['style.css','modern.css','global.css','immersive.css','admin-map.css','destination-cards.css'];fs.writeFileSync('bundle.css',files.map(p=>'/* '+p+' */\n'+fs.readFileSync(p,'utf8')).join('\n'));
