# Btech Chatbot

## Installation

1. Install [ngrok](https://ngrok.com/download). It's a binary file so you can either make it executable and run it like this `./ngrok` or add a soft link to it in `/usr/bin` or something so it's available globally and can be executed like this `ngrok`.

1. Install nodejs using [nvm](https://github.com/creationix/nvm). Make sure you install nodejs >= 6.x.x

1. Optionally, install [yarn](https://yarnpkg.com/lang/en/docs/install)

1. Install [mongodb](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu)

1. Clone the repo `git clone git@github.com:AhmedFat7y/new-btech-bot.git`

1. Enter the project's root directory `cd new-btech-bot`

1. Install dependencies `npm install` or `yarn install`

1. rename `sample.env` to `.env` and update the variables in the files accordingly (only facebook page access token and mongodb settings mostly). Remove the lines starting with `SSL_`.

1. Run `bash data-scripts/scraper.sh` to fetch the products' data from btech's website.

## Running

1. Start ngrok `ngrok http --region eu 3000`. You can replace 3000 with the actual port your nodejs server is using

1. Start the nodejs server `yarn start` or `npm start`

1. Make sure mongodb server is up and running. If it's running, you can connect to it using this command `mongo`

1. Link the facebook page to the bot from [facebook developer tools](https://developers.facebook.com/). You can refer to [this tutorial](https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start)
