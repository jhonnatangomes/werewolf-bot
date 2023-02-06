import axios from 'axios';
import { verifyKey } from 'discord-interactions';
import { Request, Response } from 'express';
import fs from 'fs';

export function readEnvFile(): void {
  if (isProduction()) return;
  const envVariables = Object.fromEntries(
    fs
      .readFileSync('.env')
      .toString()
      .split('\n')
      .map(line => line.split('='))
  ) as Record<string, string>;
  Object.entries(envVariables).forEach(([k, v]) => (process.env[k] = v));
}

export function verifyDiscordRequest(clientKey: string): (req: Request, res: Response, buf: Buffer) => void {
  return function (req, res, buf) {
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

export async function discordRequest<T>(endpoint: string, options?: Record<string, unknown>): Promise<T> {
  const url = 'https://discord.com/api/v10/' + endpoint;
  const res = await axios.request({
    url,
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    ...options,
  });
  return res.data;
}

export let currentDeveloper = '';
export function setCurrentDeveloper(): void {
  currentDeveloper = process.argv.slice(2)[0] || '';
}
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
