require('dotenv').config();

const http = require('http');

const chatId = process.env['TELEGRAM_CHAT_ID'];

const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN'] || '');

slimbot.startPolling();

const urlMap = {
  '/building': () => {
    slimbot.sendMessage(chatId, '🚧 Building book-crossing backend dev server...');
  },
  '/deployed': () => {
    slimbot.sendMessage(chatId, '✔️ Deployed book-crossing backend dev server!');
  }
};

http.createServer(function (req, res) {
  let handler = urlMap[req.url];

  if (typeof handler === 'function') {
    handler();
  }
  res.end('ok');
}).listen(process.env['PORT'] || 3030, process.env['HOST'] || 'localhost');
