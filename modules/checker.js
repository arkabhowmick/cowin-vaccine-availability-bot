const fs = require('fs');
const User = require('./user');
const request = require('request');

module.exports = class Checker {
  constructor() {}

  /* Checks for any updates */
  async check() {
    let availablity = {};
    /* Fetch all the user files */
    let users = this.getAllUsers();
    /* Loop through the users files */
    for(let userFileName of users) {
      let user = new User({ id : userFileName.split('.')[0] }); // get id of user from filename
      let subscriptions = user.getUserData().subscriptions; // get the user's subscriptions
      /* Loop through the user's subscriptions */
      for(let subscription of subscriptions) {
        let date = new Date();
        /* Fetch available centres for all subscriptions */
        let availableCentres = await this.getAvailableCenters(subscription, date);

        /* If any center is available, add it to the user's list of available centers */
        if(availableCentres) {
          if(!availablity[user.id]) {
            availablity[user.id] = [];
          }
          availablity[user.id] = availablity[user.id].concat(availableCentres);
        }

        /* Check available centers for next week as well */
        let nextWeek = new Date(date.getTime() + (7 * 24 * 60 * 60 * 1000)); 
        availableCentres = await this.getAvailableCenters(subscription, nextWeek);
        /* If any center is available, add it to the user's list of available centers */
        if(availableCentres) {
          if(!availablity[user.id]) {
            availablity[user.id] = [];
          }
          availablity[user.id] = availablity[user.id].concat(availableCentres);
        }
      }
    }
    return availablity;
  }

  /* Returns all the user files */
  getAllUsers() {
    return fs.readdirSync('data/subscriptions');
  }

  /* Returns available centers */
  getAvailableCenters(subscription, date) {
    return new Promise((resolve) => {
      let url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/';
      /* if subscribed to pincode, use calenderByPin endpoint */
      if(subscription.pincode) {
        url += 'calendarByPin?pincode=' + subscription.pincode;
      }
      /* if subscribed to district, use calenderByDistrict endpoint */
      else if(subscription.district) {
        url += 'calendarByDistrict?district_id=' + subscription.district;
      }
      url += `&date=${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`; // put current date

      /* APi call */
      request.get(url, (err, response, body) => {
        if(err) {
          console.log('Error : ', err);
          resolve(null);
        }
        else {
          /* Get available centers for the request */
          let availability = this.getAvailability(body);
          if(availability) {
            resolve(availability);
          }
          else {
            resolve(null);
          }
        }
      });
    });
  }

  /* Returns the availabe centers */
  getAvailability(response) {
    response = JSON.parse(response);
    if(!response || !response.centers || !Array.isArray(response.centers) || !response.centers.length) {
      return null;
    }
    else {
      let availability = [];
      /* Loop through the centers */
      for(let center of response.centers) {
        /* Loop through the sesisons of the center */
        for(let session of center.sessions) {
          /* If vaccine available, add data to availability list */
          if(session.available_capacity > 0) {
            availability.push(`${center.name} | ${center.address} | ${session.date} | ${session.vaccine} | Age : ${session.min_age_limit} | Available : ${session.available_capacity}`);
          }
        }
      }
      return availability.length > 0 ? availability : null;
    }
  }
  
}