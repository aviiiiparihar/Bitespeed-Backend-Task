# bitespeed-backend

Backend starter project for the Bitespeed Identity Reconciliation assignment.

## Tech Stack

- Node.js (JavaScript)
- Express.js
- Supabase (PostgreSQL)
- dotenv
- nodemon
- cors

## Project Structure

```
bitespeed-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
├── .env.example
├── package.json
├── .gitignore
└── README.md
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment file:

   ```bash
   cp .env.example .env
   ```

3. Run in development:

   ```bash
   npm run dev
   ```

4. Run in production:

   ```bash
   npm start
   ```

## Health Check

- `GET /` returns server status.
