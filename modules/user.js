const fs = require('fs');
const ALLOWED_SUBSCRIPTIONS = ['pincode', 'district'];

module.exports = class User {
  constructor({ id, is_bot, first_name, username, language_code }) {
    this.id = id;
    this.is_bot = is_bot;
    this.first_name = first_name;
    this.username = username;
    this.language_code = language_code;
  }

  isAuthenticated() {
    if(this.is_bot) {
      return false;
    }
    let registered = this.getRegisteredUsers();
    return registered.find(u => u == this.username);
  }

  subscribe(text) {
    let { key, value } = this.parseSubscription(text);
    this.validateSubscription(key, value);
    let user = this.getUserData(this.id);
    if(user.subscriptions.find(s => s[key] == value)) {
      return `You are already subscribed to ${key} : ${value}`;
    }
    else {
      user.subscriptions.push({ [key] : value });
      fs.writeFileSync(`data/subscriptions/${this.id}.json`, JSON.stringify(user));
      return `You are subscribed to ${key} : ${value}`;
    }
  }

  getSubscriptions() {
    try {
      let user = this.getUserData(this.id);
      let text = ['Your Subscriptions : '];
      for(let subscription of user.subscriptions) {
        text.push(JSON.stringify(subscription));
      }
      return text.join('\n');
    }
    catch(err){
      console.log('Error : ', err);
      return '';
    }
  }

  parseSubscription(text) {
    let data = text.split(' ');
    data = data.filter(d => d);
    return { key : data[0] ? data[0].trim() : null, value : data[1] ? data[1].trim() : null };
  }

  validateSubscription(key, value) {
    if(!key || !value) {
      throw "Missing Parameters for Subscription";
    }
    if(!ALLOWED_SUBSCRIPTIONS.includes(key)) {
      throw "Subscription not supported";
    }
  }

  unsubscribe(text) {
    let { key, value } = this.parseSubscription(text);
    this.validateSubscription(key, value);
    let user = this.getUserData(this.id);
    let index = user.subscriptions.findIndex(s => s[key] == value);
    if(index == -1) {
      return `You are not subscribed to ${key} : ${value}`;
    }
    else {
      user.subscriptions.splice(index, 1);
      fs.writeFileSync(`data/subscriptions/${this.id}.json`, JSON.stringify(user));
      return `You are unsubscribed from ${key} : ${value}`;
    }
  }

  getRegisteredUsers() {
    try {
      return JSON.parse(fs.readFileSync('data/registered_users.json').toString());
    }
    catch(err) {
      console.log('Error : ', err);
      return [];
    }
  }

  getUserData(id = this.id) {
    try {
      let file = fs.existsSync(`data/subscriptions/${id}.json`);
      if(file) {
        return JSON.parse(fs.readFileSync(`data/subscriptions/${id}.json`).toString());
      }
      else {
        return {
          id : this.id,
          first_name : this.first_name,
          username : this.username,
          subscriptions : []
        };
      }
    }
    catch(err) {
      console.log('Error : ', err);
      return {
        id : this.id,
        first_name : this.first_name,
        username : this.username,
        subscriptions : []
      };
    }
  }
}