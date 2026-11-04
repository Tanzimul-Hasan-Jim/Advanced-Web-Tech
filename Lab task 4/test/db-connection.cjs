const fs = require('node:fs');
const { Client } = require('pg');

const config = Object.fromEntries(
  fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

async function connect(database) {
  const client = new Client({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database,
    connectionTimeoutMillis: 5000,
  });
  await client.connect();
  return client;
}

async function main() {
  let admin;

  try {
    admin = await connect('postgres');
    const result = await admin.query(
      'SELECT current_user AS auth_user, EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS database_exists',
      [config.DB_DATABASE],
    );
    console.log(
      JSON.stringify({
        authentication: 'PASS',
        authenticatedUser: result.rows[0].auth_user,
        databaseExists: result.rows[0].database_exists,
      }),
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        authentication: 'FAIL',
        code: error.code || 'UNKNOWN',
        message: error.message,
      }),
    );
    process.exitCode = 1;
  } finally {
    await admin?.end();
  }
}

main();
