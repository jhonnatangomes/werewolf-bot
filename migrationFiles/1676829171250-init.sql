CREATE TABLE "games" (
	"id" serial NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	CONSTRAINT "games_pk" PRIMARY KEY ("id")
);



CREATE TABLE "players" (
	"id" serial NOT NULL,
	"role_id" int NOT NULL,
	"game_id" int NOT NULL,
	"name" TEXT NOT NULL,
	"discord_id" TEXT NOT NULL,
	CONSTRAINT "players_pk" PRIMARY KEY ("id")
);



CREATE TABLE "roles" (
	"id" serial NOT NULL,
	"name" TEXT NOT NULL,
	CONSTRAINT "roles_pk" PRIMARY KEY ("id")
);



CREATE TABLE "possible_actions" (
	"id" serial NOT NULL,
	"name" TEXT NOT NULL,
	"role_id" int NOT NULL,
	CONSTRAINT "possible_actions_pk" PRIMARY KEY ("id")
);



CREATE TABLE "actions" (
	"id" serial NOT NULL,
	"player_id" int NOT NULL,
	"possible_action_id" int NOT NULL,
	"target_player_id" int NOT NULL,
	"turn" int NOT NULL,
	"successful" bool NOT NULL,
	CONSTRAINT "actions_pk" PRIMARY KEY ("id")
);




ALTER TABLE "players" ADD CONSTRAINT "players_fk0" FOREIGN KEY ("role_id") REFERENCES "roles"("id");
ALTER TABLE "players" ADD CONSTRAINT "players_fk1" FOREIGN KEY ("game_id") REFERENCES "games"("id");


ALTER TABLE "possible_actions" ADD CONSTRAINT "possible_actions_fk0" FOREIGN KEY ("role_id") REFERENCES "roles"("id");

ALTER TABLE "actions" ADD CONSTRAINT "actions_fk0" FOREIGN KEY ("player_id") REFERENCES "players"("id");
ALTER TABLE "actions" ADD CONSTRAINT "actions_fk1" FOREIGN KEY ("possible_action_id") REFERENCES "possible_actions"("id");
