import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponent,
  MessageComponentTypes,
} from 'discord-interactions';
import { Request, Response } from 'express';
import { command, START_COMMAND, TEST_COMMAND } from './commands';
import { attributeRolesToPlayers, getRolesDistribution, startPanel } from './game';
type User = {
  avatar: string;
  avatar_decoration: string;
  discriminator: string;
  display_name: string;
  id: string;
  public_flags: number;
  username: string;
};
type BaseInteractionsBody<T extends InteractionType> = {
  type: T;
  member: {
    user: User;
  };
  channel_id: string;
  message: {
    content: string;
    components: MessageComponent[];
  };
};
type ApplicationCommandInteractionBody = {
  data: {
    name: string;
  };
} & BaseInteractionsBody<InteractionType.APPLICATION_COMMAND>;
type MessageComponentInteractionBody = {
  data: {
    component_type: MessageComponentTypes;
    custom_id: string;
  };
} & BaseInteractionsBody<InteractionType.MESSAGE_COMPONENT>;
type PingInteractionBody = BaseInteractionsBody<InteractionType.PING>;
type InteractionsBody =
  | ApplicationCommandInteractionBody
  | MessageComponentInteractionBody
  | PingInteractionBody;
let players: User[] = [];
export async function interactions(req: Request<unknown, unknown, InteractionsBody>, res: Response) {
  const { type } = req.body;
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { data } = req.body;
    if (data.name === command(TEST_COMMAND).name) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'hello world friends',
        },
      });
    }
    if (data.name === command(START_COMMAND).name) {
      players = [];
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Click join to register for the game. Click start to initiate the game.',
          components: [startPanel()],
        },
      });
    }
  }
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const { data } = req.body;
    if (data.component_type === MessageComponentTypes.BUTTON && data.custom_id === 'join') {
      const {
        member: { user },
        message: { content },
      } = req.body;
      if (players.find(player => player.id === user.id)) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'You already joined',
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
      players.push(user);
      return res.send({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {
          content:
            content.replace(/ \(\d+ players? joined\)[\s\S]*/, '') +
            ` (${players.length} ${
              players.length === 1 ? 'player' : 'players'
            } joined) \n\nJoined players:\n` +
            players.map(player => player.username).join('\n'),
        },
      });
    }
    if (data.component_type === MessageComponentTypes.BUTTON && data.custom_id === 'start') {
      try {
        const { channel_id } = req.body;
        const rolesDistribution = getRolesDistribution(players.length);
        await attributeRolesToPlayers(
          rolesDistribution,
          players.map(player => player.id),
          channel_id
        );
      } catch (e) {
        return res.send({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: (e as Error).message,
            components: [],
          },
        });
      } finally {
        players = [];
      }
    }
  }
}
