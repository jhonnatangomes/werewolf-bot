declare namespace NodeJS {
  interface ProcessEnv {
    APP_ID: string | undefined;
    GUILD_ID: string | undefined;
    DISCORD_TOKEN: string | undefined;
    PUBLIC_KEY: string | undefined;
    NODE_ENV: string;
    DATABASE_URL: string;
  }
}

type Maybe<T> = T | null | undefined;
