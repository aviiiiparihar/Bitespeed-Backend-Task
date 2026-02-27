# Bitespeed Backend - Identity Reconciliation

## Project Overview

This project implements the backend for the Bitespeed Identity Reconciliation assignment.  
It exposes an `/identify` API that reconciles contacts based on email and phone number, merges linked identities, and returns a normalized contact view with one primary identity and related secondary identities.

## Tech Stack

- Node.js (JavaScript)
- Express.js
- Supabase (PostgreSQL)
- `@supabase/supabase-js`
- dotenv
- cors
- nodemon

## Hosted URL

`<TO_BE_ADDED_AFTER_DEPLOYMENT>`

## API Documentation

### Health Check

- **Method:** `GET`
- **Endpoint:** `/`
- **Purpose:** Verify server is running

### Identify Contact

- **Method:** `POST`
- **Endpoint:** `/identify`
- **Content-Type:** `application/json`
- **Body fields:**
  - `email` (optional, string)
  - `phoneNumber` (optional, string)
- **Validation rule:** at least one of `email` or `phoneNumber` is required

### Example Request

```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

### Example Response

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["mcfly@hillvalley.edu", "mcfly@bitespeed.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2, 3]
  }
}
```

### Error Response (Validation)

```json
{
  "error": "At least one of email or phoneNumber is required"
}
```

## Run Locally

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd bitespeed-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file (or copy from `.env.example`) and set:

   ```env
   PORT=3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_key
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

5. Server runs at:

   ```text
   http://localhost:3000
   ```

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, click **New +** -> **Blueprint** and select this repo.
3. Render will read `render.yaml` and create the web service.
4. In Render dashboard, set these environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
5. Deploy the service.
6. Update the **Hosted URL** section in this README with the live URL.

### Render Runtime Notes

- The app already supports Render's dynamic port via `process.env.PORT`.
- Production start command is `npm start`.
