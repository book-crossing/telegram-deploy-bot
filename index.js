require('dotenv').config();

const http = require('http');
const { parse } = require('querystring');

const chatId = process.env['TELEGRAM_CHAT_ID'];

const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN'] || '');

try {
  slimbot.startPolling();
} catch (e) {
  console.error(e);
}

const resourceHandler = {
  'build': (body) => {
    let appName = body.data.app.name || 'unknown app';
    let text = `
      App: <b>${appName}</b>\r\n
      Status: 🚧 <b>Building</b>\r\n
      Branch: <b>dev</b>
    `;
    slimbot.sendMessage(chatId, text, 'HTML');
  },
  'release': (body) => {
    let appName = body.data.app.name || 'unknown app';
    let text = `
      App: <b>${appName}</b>\r\n
      Status: ✔️ <b>Deployed</b>\r\n
      Branch: <b>dev</b>
    `;
    slimbot.sendMessage(chatId, text, 'HTML');
  }
};

function parseBody(req) {
  if (req.method === 'POST') {
    let body = '';
    return new Promise((resolve, reject) => {
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          req.body = parse(body);
          resolve(req);
        } catch (e) {
          reject(e);
        }
      });
    })
  }
  return req;
}

http.createServer(async function (req, res) {
  if (req.method === 'POST') {
    try {
      req = await parseBody(req);
    } catch (e) { }

    console.log('POST body:', req.body);

    let resource = req.body.resource;
    let handler = resourceHandler[resource];

    if (typeof handler === 'function') {
      handler(req.body);
      res.end('ok');
    } else {
      res.writeHead(403);
      res.end();
    }
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(process.env['PORT'] || 3030, process.env['HOST'] || 'localhost');
