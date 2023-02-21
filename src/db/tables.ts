export type ActionsTable = {
  id: number;
  playerId: number;
  possibleActionId: number;
  targetPlayerId: number;
  turn: number;
  successful: boolean;
};
export type GamesTable = {
  id: number;
  createdAt: string;
  finishedAt: Maybe<string>;
};
export type MigrationsTable = {
  id: number;
  name: string;
  timestamp: string;
};
export type PlayersTable = {
  id: number;
  roleId: number;
  gameId: number;
  name: string;
  discordId: string;
};
export type PossibleActionsTable = {
  id: number;
  name: string;
  roleId: number;
};
export type RolesTable = {
  id: number;
  name: string;
};
