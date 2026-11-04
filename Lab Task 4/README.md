# Product Inventory API

A REST API for managing an inventory of products, built with NestJS, TypeORM, and PostgreSQL.

## Technologies

- Node.js and NestJS
- PostgreSQL
- TypeORM
- `class-validator` and `class-transformer`

## Features

- Create, list, retrieve, update, replace, and delete products
- Filter products by category and search names case-insensitively
- Toggle a product's active status
- PostgreSQL persistence through TypeORM repositories
- Global request validation, including rejection of unknown properties
- Decimal database prices serialized as JSON numbers

## Project structure

```text
Lab Task 4/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   └── products/
│       ├── dto/
│       │   ├── create-product.dto.ts
│       │   ├── partial-update-product.dto.ts
│       │   └── update-product.dto.ts
│       ├── entities/
│       │   └── products.entity.ts
│       ├── products.controller.ts
│       ├── products.module.ts
│       └── products.service.ts
├── test/
│   ├── api-smoke.cjs
│   └── db-connection.cjs
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

From the `Lab Task 4` directory, install dependencies:

```bash
npm install
```

## PostgreSQL setup

Start PostgreSQL and create the database **in PostgreSQL before starting the API**. For example, connect with `psql` or pgAdmin using a PostgreSQL administrator account, then execute:

```sql
CREATE DATABASE product_inventory_db;
```

Copy `.env.example` to `.env` and set `DB_PASSWORD` to the password for your local PostgreSQL `postgres` user. Keep real credentials only in the local `.env`; `.env` is ignored by Git, while `.env.example` contains placeholders.

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_actual_postgres_password
DB_DATABASE=product_inventory_db
PORT=3000
```

The application uses PostgreSQL only. TypeORM loads the Products entity from the products module and synchronizes the schema only in development (the default when `NODE_ENV` is unset). In production, set `NODE_ENV=production` and manage schema changes with migrations instead.

## Run the application

```bash
npm run start:dev
```

The API is available at `http://localhost:3000`. If PostgreSQL is stopped, the database is missing, or the credentials are incorrect, NestJS will report a connection error during startup; the application does not fall back to another database.

Build and run the compiled application:

```bash
npm run build
npm run start:prod
```

## Verification

With PostgreSQL configured in `.env`, check database connectivity with:

```bash
npm run check:db
```

Start the API in a separate terminal, then run the endpoint smoke tests with:

```bash
npm run test:api
```

The smoke test creates temporary products, exercises the API and PostgreSQL
persistence, and removes its test records when it finishes.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List products, newest first |
| `GET` | `/products/search?keyword=phone` | Case-insensitive product-name search |
| `GET` | `/products/category/Electronics` | Filter by exact category |
| `GET` | `/products/:id` | Retrieve one product |
| `PATCH` | `/products/:id` | Update supplied fields only |
| `PUT` | `/products/:id` | Replace product fields |
| `DELETE` | `/products/:id` | Delete a product |
| `PATCH` | `/products/:id/toggle` | Toggle active status |

All product routes use JSON request/response bodies where applicable. IDs must be integers. A PUT request requires `name`, `price`, and `category`; omitted optional fields reset to their defaults (`description: null`, `stock: 0`, and `isActive: true`).

## Postman examples

Create `POST http://localhost:3000/products` with `Content-Type: application/json`:

```json
{
  "name": "iPhone 15",
  "price": 999.99,
  "stock": 50,
  "category": "Electronics"
}
```

Other sample products:

```json
{
  "name": "Samsung TV",
  "price": 499.99,
  "stock": 20,
  "category": "Electronics"
}
```

```json
{
  "name": "Running Shoes",
  "price": 89.99,
  "stock": 100,
  "category": "Sports"
}
```

```json
{
  "name": "Notebook",
  "price": 4.99,
  "stock": 200,
  "category": "Stationery"
}
```

Useful requests:

- `GET http://localhost:3000/products`
- `GET http://localhost:3000/products/1`
- `GET http://localhost:3000/products/999` (404 if absent)
- `GET http://localhost:3000/products/category/Electronics`
- `GET http://localhost:3000/products/search?keyword=phone`
- `GET http://localhost:3000/products/search?keyword=s`
- `PATCH http://localhost:3000/products/1` with `{"price":899.99,"stock":45}`
- `PUT http://localhost:3000/products/1` with `{"name":"iPhone 15 Pro","price":1099.99,"stock":30,"category":"Electronics"}`
- `PATCH http://localhost:3000/products/1/toggle`
- `DELETE http://localhost:3000/products/4`

For validation checks, try a create request with a missing name, `price: -5`, an unknown property, or an empty JSON object. Try a PATCH body of `{"name":""}` and a PUT body of `{"price":799.99}`.

## Validation and errors

The global validation pipe transforms supported numeric inputs, rejects unknown properties, and returns HTTP `400` for invalid request data. Common validation errors include a missing required field, an empty name or category, a non-positive price, a negative or fractional stock value, and an extra property.

For example, an invalid request returns NestJS's standard validation response:

```json
{
  "message": [
    "name should not be empty",
    "name must be a string"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Missing products return HTTP `404` in NestJS's standard error format, for example:

```json
{
  "statusCode": 404,
  "message": "Product with ID 999 was not found.",
  "error": "Not Found"
}
```

A search without a non-empty `keyword` returns HTTP `400`. Database connection failures are surfaced during startup.
