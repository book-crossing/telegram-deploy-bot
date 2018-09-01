require('dotenv').config();

const http = require('http');

const chatId = process.env['TELEGRAM_CHAT_ID'];

const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN'] || '');

// Register listeners

// slimbot.on('message', message => {
//   slimbot.sendMessage(message.chat.id, 'Message received');
// });

// Call API

slimbot.startPolling();

const urlMap = {
  '/building': () => {
    slimbot.sendMessage(chatId, 'Building...');
  },
  '/deployed': () => {
    slimbot.sendMessage(chatId, 'Deployed...');
  }
};

http.createServer(function (req, res) {
  console.log(req);

  slimbot.sendMessage(chatId, JSON.stringify(req));

  let handler = urlMap[req.url];

  if (typeof handler === 'function') {
    handler();
  }
  res.end('ok');
}).listen(process.env['PORT'] || 3030, process.env['HOST'] || 'localhost');
