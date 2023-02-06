import express from 'express';
import { command, hasGuildCommands, START_COMMAND, TEST_COMMAND } from './commands';
import { interactions } from './interactions';
import { discordRequest, readEnvFile, setCurrentDeveloper, verifyDiscordRequest } from './utils';

readEnvFile();
setCurrentDeveloper();
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY || '') }));
app.post('/interactions', interactions);
app.get('/commands', async (_req, res) => {
  const commands = await discordRequest(
    `applications/${process.env.APP_ID}/guilds/${process.env.GUILD_ID}/commands`,
    { method: 'GET' }
  );
  res.send(commands);
});
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', PORT);
  hasGuildCommands(
    process.env.APP_ID || '',
    process.env.GUILD_ID || '',
    [TEST_COMMAND, START_COMMAND].map(command)
  );
});
