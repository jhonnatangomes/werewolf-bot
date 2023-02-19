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

export function camelize(str: string) {
  return str
    .split('_')
    .map((word, i) => (i === 0 ? word : capitalize(word)))
    .join('');
}

export function camelizeAndCapitalize(str: string) {
  return str.split('_').map(capitalize).join('');
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export let currentDeveloper = '';
export function setCurrentDeveloper(): void {
  currentDeveloper = process.argv.slice(2)[0] || '';
}
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
