import { discordRequest, readEnvFile, verifyDiscordRequest } from './utils';
import express, { Request } from 'express';
import { hasGuildCommands, TEST_COMMAND } from './commands';
import { InteractionResponseType, InteractionType } from 'discord-interactions';

readEnvFile();
const app = express();

const PORT = process.env.PORT || 3000;
type InteractionsBody = {
  type: number;
  data: {
    name: string;
  };
};
app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY || '') }));
app.post('/interactions', async (req: Request<unknown, unknown, InteractionsBody>, res) => {
  const { type, data } = req.body;
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
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
app.get('/commands', async (_req, res) => {
  const commands = await discordRequest(
    `applications/${process.env.APP_ID}/guilds/${process.env.GUILD_ID}/commands`,
    { method: 'GET' }
  );
  res.send(commands);
});
app.listen(PORT, () => {
  console.log('Listening on port', PORT);
  hasGuildCommands(process.env.APP_ID || '', process.env.GUILD_ID || '', [TEST_COMMAND]);
});
