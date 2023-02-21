import { ButtonStyleTypes, MessageComponentTypes } from 'discord-interactions';
import { discordRequest } from './common';

type Role = 'werewolf' | 'healer' | 'detective' | 'villager';

const rolesPlayersMap: Record<number, Record<Role, number>> = {
  5: {
    werewolf: 1,
    healer: 1,
    detective: 1,
    villager: 2,
  },
  6: {
    werewolf: 1,
    healer: 1,
    detective: 1,
    villager: 3,
  },
  7: {
    werewolf: 2,
    healer: 1,
    detective: 1,
    villager: 3,
  },
};
export function getRolesDistribution(numPlayers: number) {
  const numbersOfPlayers = Object.keys(rolesPlayersMap)
    .map(Number)
    .sort((a, b) => a - b);
  const [smallestNumberOfPlayers, largestNumberOfPlayers] = [
    numbersOfPlayers[0],
    numbersOfPlayers[numbersOfPlayers.length - 1],
  ];
  if (numPlayers < smallestNumberOfPlayers)
    throw new Error(`At least ${smallestNumberOfPlayers} players are required to start the game.`);
  if (smallestNumberOfPlayers <= numPlayers && numPlayers <= largestNumberOfPlayers) {
    return rolesPlayersMap[numPlayers];
  }
  return rolesPlayersMap[largestNumberOfPlayers];
}
export async function attributeRolesToPlayers(
  rolesDistribution: Record<Role, number>,
  userIds: readonly string[],
  channelId: string
) {
  const newUserIds = [...userIds];
  await Promise.all(
    Object.entries(rolesDistribution).map(([role, num]) =>
      createPrivateThread(channelId, getNRandomArrElements(newUserIds, num), role)
    )
  );
}
function getNRandomArrElements<T>(arr: T[], n: number) {
  return new Array(n).fill('').map(() => getRandomArrElement(arr));
}
function getRandomArrElement<T>(arr: T[]) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr.splice(randomIndex, 1)[0];
}
export function startPanel() {
  return {
    type: MessageComponentTypes.ACTION_ROW,
    components: [
      {
        type: MessageComponentTypes.BUTTON,
        label: 'Join',
        style: ButtonStyleTypes.PRIMARY,
        custom_id: 'join',
      },
      {
        type: MessageComponentTypes.BUTTON,
        label: 'Start',
        style: ButtonStyleTypes.PRIMARY,
        custom_id: 'start',
      },
    ],
  };
}
enum ChannelType {
  GUILD_TEXT,
  DM,
  GUILD_VOICE,
  GROUP_DM,
  GUILD_CATEGORY,
  GUILD_ANNOUNCEMENT,
  ANNOUNCEMENT_THREAD = 10,
  PUBLIC_THREAD,
  PRIVATE_THREAD,
  GUILD_STAGE_VOICE,
  GUILD_DIRECTORY,
  GUILD_FORUM,
}
export async function createPrivateThread(channelId: string, userIds: string[], name: string) {
  const data = await discordRequest<{ id: string }>(`channels/${channelId}/threads`, {
    data: {
      name,
      type: ChannelType.PRIVATE_THREAD,
    },
    method: 'POST',
  });
  await Promise.all(
    userIds.map(userId =>
      discordRequest(`channels/${data.id}/thread-members/${userId}`, {
        method: 'PUT',
      })
    )
  );
}
