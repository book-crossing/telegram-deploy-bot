require('dotenv').config();

const http = require('http');
const { parse } = require('querystring');

const chatId = process.env['TELEGRAM_CHAT_ID'];

const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN'] || '');

slimbot.startPolling();

const resourceHandler = {
  'build': (body) => {
    let appName = body.data.app.name || 'unknown app';
    slimbot.sendMessage(chatId, '🚧 Building ${appName} backend dev server...');
  },
  'release': (body) => {
    let appName = body.data.app.name || 'unknown app';
    slimbot.sendMessage(chatId, '✔️ Deployed ${appName} backend dev server!');
  }
};

function parseBody(req) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      req.body = parse(body);
    });
  }
  return req;
}

http.createServer(function (req, res) {
  if (req.method === 'POST') {
    req = parseBody(req);

    let resource = req.body.resource;
    let handler = resourceHandler[resource];

    if (typeof handler === 'function') {
      handler(req.body);
      res.end('ok');
    }
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(process.env['PORT'] || 3030, process.env['HOST'] || 'localhost');
