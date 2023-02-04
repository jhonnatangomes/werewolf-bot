# How to develop

### Creating an application

Head to https://discord.com/developers/applications, and register a new application if you haven't registered before. In order to avoid name clashes use the convention "werewolf-bot-\<your-name>". Create a new application and copy the APPLICATION_ID and PUBLIC_KEY for your app and insert it into your local .env file.

In order to install your application in the server, head over to the "OAuth2" section, then "URL Generator" and select the appropriate scopes. Scopes will grow with the project, but the minimum set of them necessary to start are applications.commands and bot. After selecting the bot scope you will also need to select the bot permissions for "Send Messages" and "Use Slash Commands".

Finally, copy the generated URL, paste it into a browser and authorize your application into the discord server.

### Creating a bot

Head to the Bot section and create a new one. Hit the reset token button to generate your DISCORD_TOKEN and store it into your .env file.

### Uploading a local server

Whenever you're developing, you're going to need to create a public server address via ngrok (npm run dev:server). You then need to copy the url that redirects traffic to your localhost instance, go to the "General Information" tab and paste it under the "Interactions Endpoint Url". Note that you should add the endpoint "/interactions" in the end, so that if your url is abc.com, you will type "abc.com/interactions". Now you're ready to go.

### Debugging

When registering slash commands in your bot, you can make a request to the internal endpoint "/commands" to see your registered commands via

```
curl http://localhost:3000/commands
```

or alternatively you can run the script `npm run get-commands`.

All information stated here can also be found in https://discord.com/developers/docs. Happy coding.

ps: From now on, let's not push anything more directly to main, the infrastructure of the project is already setup and we should only be opening pull requests to include new features.
