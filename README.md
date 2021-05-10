# cowin-vaccine-availability-bot

This is a telegram bot that allows user to subscribe to updates if vaccine is available for their area

## Instructions
* Create a Telegram bot using BotFather with telegram. You will be provided with a bot key. Put the key in config.js file.
* Delete `users1.json` file from data/subscriptions folder.
* Put your username in the array inside `registered_users.json` file. Only the usernames inside this file will be allowed to subscribe.
* Run `npm install`
* Execute `node index.js`

## Telegram commands
* /subscribe pincode 111111 -> Checks for available slots in the pincode 
* /subscribe district 711 -> Checks for available slots in the district
* /unsubscribe pincode 111111 -> Unsubscribes from the pincode
* /unsubscribe district 711 -> Unsubscribes from the district
* /get -> Returns the list of all the subscriptions for the user.
