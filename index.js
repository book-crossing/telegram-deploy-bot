require('dotenv').config();

const express = require("express");
const myParser = require("body-parser");

const chatId = process.env['TELEGRAM_CHAT_ID'];

const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN'] || '');

try {
  slimbot.startPolling();
} catch (e) {
  console.error(e);
}

const resourceHandler = {
  'create': {
    'build': (body) => {
      let appName = body.data.app.name || 'unknown app';
      let author = body.actor.email || 'unknown author';
      let text = `
App: *${appName}*
Status: 🚧 *Building*
Branch: *${body.branch}*
Author: [${author}](mailto:${author})
    `;
      slimbot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    },
    'release': (body) => {
      let appName = body.data.app.name || 'unknown app';
      let author = body.actor.email || 'unknown author';
      let version = body.data.version || 'unknown';
      let text = `
App: *${appName}* (version ${version})
Status: ✔️ *Deployed*
Branch: *${body.branch}*
Author: [${author}](mailto:${author})
    `;
      slimbot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    }
  }
};

function handleHook(branch, req, res) {
  req.body.branch = branch;
  let resource = req.body.resource;
  let action = req.body.action;

  let handler = (resourceHandler[action] || {})[resource];

  if (typeof handler === 'function') {
    handler(req.body);
    res.end('ok');
  } else {
    res.writeHead(403);
    res.end();
  }
}

const app = express();
app.use(myParser.json({ extended: true }));
app.post('/dev', handleHook('dev', req, res));
app.post('/master', handleHook('master', req, res));
app.listen(process.env['PORT'] || 3030, process.env['HOST'] || 'localhost');
