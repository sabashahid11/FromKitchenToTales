# Authentication

## Endpoints
- `POST /signin`
- `POST /signup`

## Request Bodies

### `/signin`
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```
Only `email` and `password` are required; missing or blank values lead to HTTP 400 with `{"error": "Request body must include non-empty 'email' and 'password' strings."}`.

### `/signup`
```json
{
  "username": "chef_jane",
  "email": "user@example.com",
  "password": "StrongPass123"
}
```
`username`, `email`, and `password` must be non-empty strings. Validation errors reuse the same 400 response format noted above even though the message references only email/password.

## Responses
- **/signin success (200)**
  ```json
  {
    "message": "Signed in successfully",
    "auth": { ...Supabase auth payload... }
  }
  ```
  `auth` echoes the Supabase response (converted to JSON) when available.
- **/signup success (201)**
  ```json
  {
    "message": "Signup successful. Please verify your email if required.",
    "auth": { ...Supabase auth payload... }
  }
  ```

## Failure Modes
- Supabase errors (network, invalid credentials, duplicates, etc.) surface as HTTP 502 with a body shaped like `{"error": "Failed to sign in", "details": "<supabase error>"}` or `{"error": "Failed to sign up", "details": "..."}`.
- The service never mutates or stores passwords locally; it forwards them to Supabase Auth. `signup` also creates a `users_info` row with the new account id, provided username, and email.
