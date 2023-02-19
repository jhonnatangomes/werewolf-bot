import { readEnvFile } from './utils';
readEnvFile();

import { execSync } from 'child_process';
import { Command } from 'commander';
import { readdirSync, writeFileSync } from 'fs';
import path from 'path';
import { PoolClient } from 'pg';
import { pool } from './db';

let client: PoolClient;

async function runMigration() {
  const fileNames = readdirSync('./migrationFiles');
  const lastMigration = await getLastRunMigration();
  const lastMigrationIndex = fileNames.findIndex(file => file === lastMigration);
  const runMigrations = fileNames.slice(lastMigrationIndex === -1 ? 0 : lastMigrationIndex + 1).map(file => {
    execSync(`psql ${process.env.DATABASE_URL} -f ${path.join('./migrationFiles', file)}`);
    return file.replace('.sql', '');
  });
  await markRunMigrations(runMigrations);
}

async function getLastRunMigration(): Promise<string> {
  await initializeMigrationTable();
  const { rows } = await client.query('select name from migrations order by timestamp desc limit 1');
  return rows[0]?.name || '';
}

async function initializeMigrationTable() {
  const { rowCount } = await client.query(
    "select * from information_schema.tables where table_name = 'migrations'"
  );
  if (!rowCount) {
    await client.query(
      `create table "migrations" (
        "id" serial primary key,
        "name" text not null,
        "timestamp" timestamp with time zone not null
      )`
    );
  }
}

async function markRunMigrations(names: string[]) {
  await Promise.all(
    names.map(name =>
      client.query(
        `insert into migrations (name, timestamp) values ('${name}', to_timestamp(${
          name.split('-')[0]
        }/1000))`
      )
    )
  );
}

function createMigration(name: string) {
  writeFileSync(`./migrationFiles/${Date.now()}-${name}.sql`, '');
}

async function main() {
  client = await pool.connect();
  const program = new Command();
  program
    .command('create')
    .description('Creates a migration file with the given name')
    .argument('<string>', 'name to use in the migration file')
    .action(createMigration);

  program.command('run').description('Runs the missing migrations').action(runMigration);

  program.parseAsync().then(() => client.release());
}

main();
