const assert = require('node:assert/strict');
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
const baseUrl = 'http://localhost:3000';
const tag = `LabTask4Verification-${Date.now()}`;
const createdIds = [];

async function request(path, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}

async function expectStatus(path, method, body, expectedStatus) {
  const result = await request(path, method, body);
  assert.equal(
    result.status,
    expectedStatus,
    `${method} ${path}: expected ${expectedStatus}, received ${result.status}`,
  );
  return result.body;
}

async function verifyDatabasePersistence(id, expectedName) {
  const client = new Client({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    connectionTimeoutMillis: 5000,
  });

  await client.connect();
  try {
    const persisted = await client.query(
      'SELECT id, name, price::float8 AS price, stock FROM products WHERE id = $1',
      [id],
    );
    assert.equal(persisted.rowCount, 1);
    assert.equal(persisted.rows[0].name, expectedName);

    const table = await client.query(
      "SELECT to_regclass('public.products') AS products_table",
    );
    assert.equal(table.rows[0].products_table, 'products');
  } finally {
    await client.end();
  }
}

async function cleanupCreatedProducts() {
  if (createdIds.length === 0) {
    return;
  }

  const client = new Client({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    connectionTimeoutMillis: 5000,
  });

  await client.connect();
  try {
    await client.query('DELETE FROM products WHERE id = ANY($1::int[])', [
      createdIds,
    ]);
  } finally {
    await client.end();
  }
}

async function runApiTests() {
  const phoneName = `${tag} phone`;
  const tabletName = `${tag} tablet`;
  const phone = await expectStatus(
    '/products',
    'POST',
    {
      name: phoneName,
      description: 'Temporary API verification product',
      price: 499.99,
      stock: 12,
      category: 'Electronics',
    },
    201,
  );
  createdIds.push(phone.data.id);

  const tablet = await expectStatus(
    '/products',
    'POST',
    {
      name: tabletName,
      price: 299.5,
      stock: 4,
      category: 'Electronics',
    },
    201,
  );
  createdIds.push(tablet.data.id);

  const all = await expectStatus('/products', 'GET', undefined, 200);
  assert(all.data.some((product) => product.id === phone.data.id));
  assert(all.data.some((product) => product.id === tablet.data.id));

  const one = await expectStatus(
    `/products/${phone.data.id}`,
    'GET',
    undefined,
    200,
  );
  assert.equal(one.data.name, phoneName);

  const search = await expectStatus(
    `/products/search?keyword=${encodeURIComponent(tag)}%20phone`,
    'GET',
    undefined,
    200,
  );
  assert(search.data.some((product) => product.id === phone.data.id));
  await expectStatus('/products/search?keyword=', 'GET', undefined, 400);

  const category = await expectStatus(
    '/products/category/Electronics',
    'GET',
    undefined,
    200,
  );
  assert(category.data.some((product) => product.id === phone.data.id));
  assert(category.data.some((product) => product.id === tablet.data.id));

  const patched = await expectStatus(
    `/products/${phone.data.id}`,
    'PATCH',
    { price: 549.5, stock: 10 },
    200,
  );
  assert.equal(patched.data.price, 549.5);
  assert.equal(patched.data.stock, 10);
  assert.equal(patched.data.name, phoneName);
  assert.equal(patched.data.category, 'Electronics');
  await expectStatus(
    `/products/${phone.data.id}`,
    'PATCH',
    { name: '' },
    400,
  );

  const replaced = await expectStatus(
    `/products/${phone.data.id}`,
    'PUT',
    {
      name: `${tag} replacement`,
      price: 599.99,
      category: 'Electronics',
    },
    200,
  );
  assert.equal(replaced.data.name, `${tag} replacement`);
  assert.equal(replaced.data.stock, 0);
  assert.equal(replaced.data.description, null);
  await expectStatus(
    `/products/${phone.data.id}`,
    'PUT',
    { price: 799.99 },
    400,
  );

  const toggledOff = await expectStatus(
    `/products/${phone.data.id}/toggle`,
    'PATCH',
    undefined,
    200,
  );
  assert.equal(toggledOff.data.isActive, false);
  const toggledOn = await expectStatus(
    `/products/${phone.data.id}/toggle`,
    'PATCH',
    undefined,
    200,
  );
  assert.equal(toggledOn.data.isActive, true);

  await expectStatus(
    '/products',
    'POST',
    {
      name: '',
      price: -1,
      category: 'Electronics',
      unexpectedField: true,
    },
    400,
  );
  await expectStatus('/products', 'POST', { price: 1 }, 400);
  await expectStatus('/products', 'POST', {}, 400);
  await expectStatus(
    `/products/${tablet.data.id}`,
    'PATCH',
    { stock: -1 },
    400,
  );
  await expectStatus('/products/not-an-id', 'GET', undefined, 400);

  await verifyDatabasePersistence(tablet.data.id, tabletName);

  const deletedPhone = await expectStatus(
    `/products/${phone.data.id}`,
    'DELETE',
    undefined,
    200,
  );
  assert.equal(deletedPhone.id, phone.data.id);
  await expectStatus(
    `/products/${phone.data.id}`,
    'GET',
    undefined,
    404,
  );
  await expectStatus(
    `/products/${tablet.data.id}`,
    'DELETE',
    undefined,
    200,
  );
  await expectStatus(
    `/products/${tablet.data.id}`,
    'DELETE',
    undefined,
    404,
  );
}

async function main() {
  let testError;

  try {
    await runApiTests();
  } catch (error) {
    testError = error;
  }

  try {
    await cleanupCreatedProducts();
  } catch (cleanupError) {
    console.error(`API smoke-test cleanup failed: ${cleanupError.message}`);
    if (!testError) {
      testError = cleanupError;
    }
  }

  if (testError) {
    throw testError;
  }

  console.log(
    JSON.stringify({
      apiEndpoints: 'PASS',
      validation: 'PASS',
      deletion404: 'PASS',
      postgresPersistence: 'PASS',
      cleanup: 'PASS',
    }),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
