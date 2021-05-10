
const TelegramBot = require('node-telegram-bot-api');
const User = require('./modules/user');
const Checker = require('./modules/checker');
const CONFIG = require('./config');
const bot = new TelegramBot(CONFIG.TELEGRAM_TOKEN, {polling: true});
const checker = new Checker();

/* Check if any slot is available */
setInterval(async () => {
  let availability = await checker.check();
  /* If any slot is available, return those to the user; send only first 5 */
  if(availability && Object.keys(availability) && Object.keys(availability).length > 0) {
    for(let userid in availability) {
      /* Send message to each user */
      bot.sendMessage(userid, availability[userid].filter((e, index) => index < 5).join('\n'));
    }
  }
}, CONFIG.CHECK_INTERVAL);

/* Handle new subscriptions */
bot.onText(/\/subscribe (.+)/, ({ from }, match) => {
  let user = new User(from);
  /* If user is authenticated, allow subscription */
  if(user.isAuthenticated()) {
    try {
      let subscriptionStatus = user.subscribe(match[1]);
      bot.sendMessage(user.id, subscriptionStatus);
    }
    catch(err) {
      console.log('ERROR " ', err);
      bot.sendMessage(user.id, err);
    }
  }
  else {
    bot.sendMessage(user.id, 'You are not permitted to use this bot');
  }
});

/* Return existing subscriptions for the user */
bot.onText(/\/get/, ({ from }, match) => {
  let user = new User(from);
  /* If user is authenticated, return subscriptions */
  if(user.isAuthenticated()) {
    bot.sendMessage(user.id, user.getSubscriptions());
  }
  else {
    bot.sendMessage(user.id, 'You are not permitted to use this bot');
  }
});

/* Unsubscribe from the subscription */
bot.onText(/\/unsubscribe (.+)/, ({ from }, match) => {
  let user = new User(from);
  if(user.isAuthenticated()) {
    try {
      let subscriptionStatus = user.unsubscribe(match[1]);
      bot.sendMessage(user.id, subscriptionStatus);
    }
    catch(err) {
      console.log('ERROR " ', err);
      bot.sendMessage(user.id, err);
    }
  }
  else {
    bot.sendMessage(user.id, 'You are not permitted to use this bot');
  }
});