import { readEnvFile, verifyDiscordRequest } from './utils';
import express from 'express';
import { hasGuildCommands, TEST_COMMAND } from './commands';
import { InteractionResponseType, InteractionType } from 'discord-interactions';

readEnvFile();

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY) }));
app.post('/interactions', async (req, res) => {
  const { type, name } = req.body;
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
  if (type === InteractionType.APPLICATION_COMMAND) {
    if (name === TEST_COMMAND.name) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'hello world friends',
        },
      });
    }
  }
});
app.listen(PORT, () => {
  console.log('Listening on port', PORT);

  hasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [TEST_COMMAND]);
});
