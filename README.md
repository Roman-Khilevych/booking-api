# Booking API

REST API for booking activities (yacht trips, diving, tours) with per-date seat availability.

## Stack

NestJS 12 · TypeScript · PostgreSQL 17 · TypeORM · class-validator · Vitest · Docker Compose

## Getting started

Requirements: Node.js 22+, Docker.

```bash
cp .env.example .env      # local DB credentials, used by both the app and Docker
docker compose up -d      # start PostgreSQL
npm i
npm run start:dev         # http://localhost:3000
```

Tables are created automatically on startup. Ready-made requests for every endpoint are in [
`requests.http`](requests.http), which you can run from the WebStorm / IntelliJ HTTP Client.

## Endpoints

| Method   | Path                   | Description                                       |
|----------|------------------------|---------------------------------------------------|
| `GET`    | `/activities`          | List activities                                   |
| `GET`    | `/activities/:id`      | Get one activity                                  |
| `POST`   | `/activities`          | Create an activity                                |
| `PATCH`  | `/activities/:id`      | Update an activity (partial)                      |
| `DELETE` | `/activities/:id`      | Delete an activity (`409` if it has bookings)     |
| `GET`    | `/bookings`            | List bookings with their activity                 |
| `GET`    | `/bookings/:id`        | Get one booking                                   |
| `POST`   | `/bookings`            | Book seats for a date (`409` if not enough seats) |
| `PATCH`  | `/bookings/:id`        | Update customer name / email                      |
| `PATCH`  | `/bookings/:id/cancel` | Cancel a booking and free its seats               |

Example: create a booking

```json
POST /bookings
{
  "activityId": 1,
  "date": "2027-06-15",
  "customerName": "Anna",
  "customerEmail": "anna@example.com",
  "seats": 2
}
```

## Design decisions

- **Prices are stored in cents** (`int`) to avoid floating-point rounding errors: `9000` means 90.00.
- **Capacity is per date.** Each activity offers `capacity` seats every day. Cancelled bookings don't count toward taken
  seats.
- **No overbooking.** A booking is created in a transaction that locks the activity row (`SELECT ... FOR UPDATE`), so
  concurrent requests for the last seats can't both succeed.
- **`totalPrice` is fixed at booking time.** Later price changes don't affect existing bookings.
- **Bookings are cancelled, not deleted.** This keeps the history. An activity that has bookings can't be deleted.
- **Strict validation.** Unknown fields in request bodies are rejected with `400`.
- **`synchronize` is for development only.** TypeORM auto-syncs the schema unless `NODE_ENV=production`.

## Not implemented yet

- Authentication and authorization (`GET /bookings` currently exposes customer data to anyone)
- Database migrations (required before any production deploy, instead of `synchronize`)
- Real tests (only "should be defined" smoke tests exist; no service logic or e2e tests)
- Pagination and filtering for lists
