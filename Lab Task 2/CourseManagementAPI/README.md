# Course Management API — Lab Task 02

NestJS REST API demonstrating DTO validation, global pipes, and course-material upload.

## Run locally

```bash
npm install
npm run start:dev
```

The server listens at `http://localhost:3000`.

## Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/course` | List response |
| GET | `/course/:id` | Course lookup response |
| POST | `/course` | Validate and echo course data |
| PUT | `/course/:id` | Validate full-update request data |
| PATCH | `/course/:id` | Validate partial-update request data |
| DELETE | `/course/:id` | Deletion response |
| POST | `/course/:id/upload` | Upload course material |

## Create-course JSON

```json
{
  "name": "NestJS Fundamentals",
  "code": "CS101",
  "instructor": "John Doe",
  "credits": 3,
  "description": "Introduction to NestJS"
}
```

The `name`, `code`, `instructor`, and `credits` fields are required. Credits must be between 1 and 6. `description` is optional. The global `ValidationPipe` rejects unknown properties and transforms inputs.

## Upload in Postman

1. Use `POST http://localhost:3000/course/5/upload`.
2. Select **Body → form-data**.
3. Add key `file`, change its type to **File**, and select a `.jpg`, `.jpeg`, `.png`, or `.pdf`.
4. Send the request.

Files larger than 2 MB and unsupported extensions are rejected. Uploaded runtime files are excluded from Git.

## Validation checks

- Empty required strings or missing required fields → `400 Bad Request`.
- Credits greater than 6 → `400 Bad Request`.
- Unknown JSON fields → `400 Bad Request`.
- `.txt` / `.exe` upload → file type error.
- Upload larger than 2 MB → size error.

## Architecture

The controller maps HTTP requests, the service returns response objects, DTOs define and validate request shapes, and the course module wires the controller and service. This lab demonstrates validation and upload handling; it does not require database persistence.
