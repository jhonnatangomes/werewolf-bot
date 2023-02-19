import { camelize, camelizeAndCapitalize, readEnvFile } from '../utils';
readEnvFile();

import { writeFileSync } from 'fs';
import { pool } from '.';

async function generateSchema() {
  const client = await pool.connect();
  const { rows } = await client.query(
    `select 
      table_name, 
      column_name, 
      data_type, 
      is_nullable 
    from information_schema.columns 
    where table_schema = 'public' 
    order by table_name, ordinal_position`
  );
  const result = rows as {
    table_name: string;
    column_name: string;
    data_type: string;
    is_nullable: 'YES' | 'NO';
  }[];
  const objSchema = result.reduce((acc, { table_name, column_name: name, data_type, is_nullable }) => {
    const table = acc.find(t => t.table_name === table_name);
    if (table) {
      table.columns.push({ name, data_type: getTsDataType(data_type, is_nullable) });
    } else {
      acc.push({ table_name, columns: [{ name, data_type: getTsDataType(data_type, is_nullable) }] });
    }
    return acc;
  }, [] as { table_name: string; columns: { name: string; data_type: string }[] }[]);
  const stringSchema =
    objSchema
      .map(
        ({ table_name, columns }) =>
          `export type ${camelizeAndCapitalize(table_name)}Table = {\n${columns
            .map(({ name, data_type }) => `  ${camelize(name)}: ${data_type};`)
            .join('\n')}\n};`
      )
      .join('\n') + '\n';
  writeFileSync('./src/db/tables.ts', stringSchema);
  client.release();
  pool.end();
}

function getTsDataType(data_type: string, is_nullable: 'YES' | 'NO') {
  const dataTypeMap: Record<string, string> = {
    integer: 'number',
    text: 'string',
    'timestamp with time zone': 'string',
    boolean: 'boolean',
  };
  const tsType = dataTypeMap[data_type] || 'unknown';
  return is_nullable === 'YES' ? `Maybe<${tsType}>` : tsType;
}

generateSchema();
