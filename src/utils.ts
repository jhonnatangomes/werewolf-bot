import fs from 'fs';
import { Request, Response } from 'express';
import { verifyKey } from 'discord-interactions';
import axios from 'axios';

export function readEnvFile() {
  if (process.env.NODE_ENV === 'production') return;
  const envVariables = Object.fromEntries(
    fs
      .readFileSync('.env')
      .toString()
      .split('\n')
      .map(line => line.split('='))
  ) as Record<string, string>;
  Object.entries(envVariables).forEach(([k, v]) => (process.env[k] = v));
}

export function verifyDiscordRequest(clientKey: string) {
  return function (req: Request, res: Response, buf: Buffer) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    if (!signature || !timestamp) return;

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function discordRequest(endpoint: string, options: Record<string, unknown>) {
  const url = 'https://discord.com/api/v10/' + endpoint;
  const res = await axios.request({
    url,
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    ...options,
  });
  if (res.status !== 200) {
    // eslint-disable-next-line no-console
    console.log(res.status);
    throw new Error(JSON.stringify(res.data));
  }
  return res.data;
}
