# Lab Task 3: University System API

A standalone NestJS API demonstrating intra-module, inter-module, and circular dependency injection.

## Setup

```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:3000` by default.

## Routes

| Method | Route | Example body |
| --- | --- | --- |
| GET | `/course` | |
| GET | `/course/:id` | |
| POST | `/course` | `{ "name": "NestJS", "code": "CS301" }` |
| GET | `/enrollment` | |
| POST | `/enrollment` | `{ "studentName": "John Doe", "courseId": "101" }` |
| POST | `/notification/send` | `{ "studentName": "John Doe", "message": "Welcome!" }` |
| POST | `/notification/check` | `{ "studentName": "John Doe", "courseId": "101" }` |

Run the unit tests with `npm test -- --runInBand`.
