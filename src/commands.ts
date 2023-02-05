import { currentDeveloper, discordRequest, isProduction } from './utils';

export async function hasGuildCommands(appId: string, guildId: string, commands: Command[]): Promise<void> {
  if (guildId === '' || appId === '') return;
  commands.forEach(c => hasGuildCommand(appId, guildId, c));
}

/* eslint-disable no-console */
async function hasGuildCommand(appId: string, guildId: string, command: Command): Promise<void> {
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  const data = await discordRequest<Command[]>(endpoint, { method: 'GET' });
  if (data) {
    const installedNames = data.map(c => c['name']);
    if (!installedNames.includes(command['name'])) {
      console.log(`Installing "${command['name']}"`);
      installGuildCommand(appId, guildId, command);
    } else {
      console.log(`"${command['name']}" command already installed`);
    }
  }
}
/* eslint-enable no-console */

export async function installGuildCommand(appId: string, guildId: string, command: Command): Promise<void> {
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  await discordRequest(endpoint, { method: 'POST', data: JSON.stringify(command) });
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
export const TEST_COMMAND = {
  name: 'my-bot-test',
  description: 'Basic guild command',
  type: ApplicationCommandType.ChatInput,
};
export function command(command: Command): Command {
  if (isProduction()) return command;
  return {
    ...command,
    name: currentDeveloper ? `${command.name}-${currentDeveloper}` : command.name,
  };
}
