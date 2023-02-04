declare namespace NodeJS {
  interface ProcessEnv {
    APP_ID: string;
    GUILD_ID: string;
    DISCORD_TOKEN: string;
    PUBLIC_KEY: string;
    NODE_ENV: string;
  }
}
