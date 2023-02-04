import { discordRequest } from './utils';

export async function hasGuildCommands(appId: string, guildId: string, commands: Command[]) {
  if (guildId === '' || appId === '') return;

  commands.forEach(c => hasGuildCommand(appId, guildId, c));
}

// Checks for a command
async function hasGuildCommand(appId: string, guildId: string, command: Command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;

  try {
    const data = (await discordRequest(endpoint, { method: 'GET' })) as Command[];

    if (data) {
      const installedNames = data.map(c => c['name']);
      if (!installedNames.includes(command['name'])) {
        console.log(`Installing "${command['name']}"`);
        installGuildCommand(appId, guildId, command);
      } else {
        console.log(`"${command['name']}" command already installed`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export async function installGuildCommand(appId: string, guildId: string, command: Command) {
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  try {
    await discordRequest(endpoint, { method: 'POST', data: JSON.stringify(command) });
  } catch (err) {
    console.error(err);
  }
}

enum ApplicationCommandType {
  ChatInput = 1,
  User,
  Message,
}
enum ApplicationCommandOptionType {
  SubCommand = 1,
  SubCommandGroup,
  String,
  Integer,
  Boolean,
  User,
  Channel,
  Role,
  Mentionable,
  Number,
  Attachment,
}
type ApplicationCommandOptionChoice = { name: string; value: string | number };
type ApplicationCommandOption = {
  name: string;
  type: ApplicationCommandOptionType;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
};
type Command = {
  name: string;
  description: string;
  type: ApplicationCommandType;
  options?: ApplicationCommandOption[];
};
// Simple test command
export const TEST_COMMAND = {
  name: 'my-bot-test',
  description: 'Basic guild command',
  type: ApplicationCommandType.ChatInput,
};
