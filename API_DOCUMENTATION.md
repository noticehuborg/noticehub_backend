# NoticeHub API Documentation

**Version:** 1.0.0

**Base URL (Development):** `http://localhost:5550/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Standard Response Format](#standard-response-format)
4. [Valid Field Values](#valid-field-values)
5. [Auth Endpoints](#auth-endpoints)
6. [User Endpoints](#user-endpoints)
7. [Admin Endpoints](#admin-endpoints)
8. [Error Codes](#error-codes)

---

## Overview

NoticeHub is a university notice board backend API built with Node.js + Express, PostgreSQL (Supabase), and Sequelize ORM.

**Three roles exist:**
- `student` — self-registers
- `course_rep` — created by admin
- `admin` — super user

**Protected routes** require a JWT access token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

Access tokens expire in **15 minutes**. Use the refresh endpoint to get a new one.

---

## Standard Response Format

**Success:**
```json
{
  "status": "success",
  "message": "Description of what happened",
  "data": { }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Description of the error",
  "errors": ["field-level errors if validation failed"]
}
```

---

## Valid Field Values

| Field | Accepted Values |
|---|---|
| `program` | `"Bsc. Computer Science"` \| `"Bsc. Information Technology"` |
| `level` | `"100"` \| `"200"` \| `"300"` \| `"400"` |
| `role` | `"student"` \| `"course_rep"` \| `"admin"` |

---

## Auth Endpoints

### 1. Register
**POST** `/auth/register`
No authentication required.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "program": "Bsc. Computer Science",
  "level": "100"
}
```

**Success Response `201`:**
```json
{
  "status": "success",
  "message": "Registration successful. Check your email for the OTP.",
  "data": null
}
```

**Notes:**
- Role is hardcoded to `student` — cannot be set by the user
- A 4-digit OTP is sent to the email
- Account must be verified with OTP before login

---

### 2. Login
**POST** `/auth/login`
No authentication required.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "must_reset_password": false,
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "program": "Bsc. Computer Science",
      "level": "100",
      "avatar_url": null
    }
  }
}
```

**Notes:**
- If `must_reset_password` is `true`, redirect the user to the change password screen before anything else (applies to course reps on first login)
- Store both tokens — use `access_token` for requests, `refresh_token` to get a new access token

---

### 3. Verify OTP
**POST** `/auth/verify-otp`
No authentication required.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "3821"
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Account verified successfully",
  "data": null
}
```

**Notes:**
- OTP expires in **10 minutes**
- OTP is exactly 4 digits

---

### 4. Resend OTP
**POST** `/auth/resend-otp`
No authentication required.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "OTP resent successfully",
  "data": null
}
```

---

### 5. Forgot Password
**POST** `/auth/forgot-password`
No authentication required.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "If that email exists, a reset link has been sent.",
  "data": null
}
```

**Notes:**
- Always returns `200` regardless of whether the email exists (prevents email enumeration)
- Reset link points to: `FRONTEND_URL/reset-password?token=<token>`
- Token expires in **1 hour**
- Frontend must extract the `token` from the URL and send it to the reset-password endpoint

---

### 6. Reset Password
**POST** `/auth/reset-password`
No authentication required.

**Request Body:**
```json
{
  "token": "the_token_from_the_reset_email_link",
  "password": "newpassword123"
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Password reset successful",
  "data": null
}
```

---

### 7. New Password (Forced Reset)
**POST** `/auth/new-password`
Requires Bearer token.

Used when `must_reset_password` is `true` after login (course reps on first login).

**Request Body:**
```json
{
  "password": "mynewpassword123"
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Password updated successfully",
  "data": null
}
```

---

### 8. Refresh Token
**POST** `/auth/refresh`
No authentication required.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Notes:**
- Call this when you receive a `401` with `"Invalid or expired token"` on any protected route
- Both tokens are rotated — store the new ones

---

### 9. Logout
**POST** `/auth/logout`
Requires Bearer token.

No request body needed.

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Logged out successfully",
  "data": null
}
```

---

## User Endpoints

All user endpoints require `Authorization: Bearer <access_token>`.

---

### 1. Get My Profile
**GET** `/users/me`

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "program": "Bsc. Computer Science",
      "level": "100",
      "avatar_url": "https://res.cloudinary.com/...",
      "is_verified": true,
      "is_active": true,
      "must_reset_password": false,
      "created_at": "2026-03-18T00:00:00.000Z",
      "updated_at": "2026-03-18T00:00:00.000Z"
    }
  }
}
```

---

### 2. Update My Profile
**PATCH** `/users/me`
Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `full_name` | Text | Optional | New display name |
| `avatar` | File | Optional | Profile picture (image file) |

At least one field must be provided.

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Profile updated",
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "Updated Name",
      "avatar_url": "https://res.cloudinary.com/dz2r5op3s/image/upload/..."
    }
  }
}
```

---

### 3. Change My Password
**PATCH** `/users/me/password`

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Password changed successfully",
  "data": null
}
```

---

### 4. Request Level Correction
**POST** `/users/me/level-correction`
Available to students only.

**Request Body:**
```json
{
  "requested_level": "200",
  "reason": "I repeated level 100 last year"
}
```

**Success Response `201`:**
```json
{
  "status": "success",
  "message": "Level correction request submitted",
  "data": {
    "request": {
      "id": "uuid",
      "user_id": "uuid",
      "current_level": "100",
      "requested_level": "200",
      "reason": "I repeated level 100 last year",
      "status": "pending",
      "created_at": "2026-03-18T00:00:00.000Z"
    }
  }
}
```

**Notes:**
- Only one pending request allowed at a time
- Admin approves or rejects from the admin endpoints

---

### 5. List All Users (Admin Only)
**GET** `/users`

**Query Parameters (all optional):**

| Param | Type | Description |
|---|---|---|
| `role` | string | Filter by role |
| `program` | string | Filter by program |
| `level` | string | Filter by level |
| `is_active` | boolean | Filter by active status |
| `search` | string | Search by name or email |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "users": [ { } ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

### 6. Get User by ID (Admin Only)
**GET** `/users/:id`

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "user": { }
  }
}
```

---

### 7. Update User (Admin Only)
**PATCH** `/users/:id`

**Request Body (any combination):**
```json
{
  "full_name": "New Name",
  "email": "newemail@example.com",
  "role": "course_rep",
  "program": "Bsc. Information Technology",
  "level": "300",
  "is_active": true
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "User updated",
  "data": {
    "user": { }
  }
}
```

---

### 8. Deactivate User (Admin Only)
**DELETE** `/users/:id`

No request body needed.

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "User deactivated",
  "data": null
}
```

**Notes:**
- This is a soft delete — the user record is kept but `is_active` is set to `false`
- Deactivated users cannot log in

---

## Admin Endpoints

All admin endpoints require `Authorization: Bearer <access_token>` from an **admin** account.

---

### 1. Create Course Rep
**POST** `/admin/users/create-rep`

**Request Body:**
```json
{
  "full_name": "George Rep",
  "email": "rep@example.com",
  "program": "Bsc. Information Technology",
  "level": "200"
}
```

**Success Response `201`:**
```json
{
  "status": "success",
  "message": "Course rep created and credentials emailed",
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "George Rep",
      "email": "rep@example.com",
      "role": "course_rep",
      "program": "Bsc. Information Technology",
      "level": "200"
    }
  }
}
```

**Notes:**
- A temporary password is auto-generated and emailed to the rep
- `must_reset_password` is set to `true` — rep must change password on first login

---

### 2. Get Stats
**GET** `/admin/stats`

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "totalUsers": 120,
    "totalAnnouncements": 45,
    "pendingCorrections": 3
  }
}
```

---

### 3. List Level Correction Requests
**GET** `/admin/level-corrections`

**Query Parameters (optional):**

| Param | Values | Description |
|---|---|---|
| `status` | `pending` \| `approved` \| `rejected` | Filter by status |
| `page` | number | Page number |
| `limit` | number | Results per page |

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "requests": [
      {
        "id": "uuid",
        "current_level": "100",
        "requested_level": "200",
        "reason": "Repeated year",
        "status": "pending",
        "user": {
          "id": "uuid",
          "full_name": "John Doe",
          "email": "john@example.com",
          "program": "Bsc. Computer Science",
          "level": "100"
        },
        "created_at": "2026-03-18T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

---

### 4. Approve / Reject Level Correction
**PATCH** `/admin/level-corrections/:id`

**Request Body:**
```json
{
  "status": "approved"
}
```
or
```json
{
  "status": "rejected"
}
```

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Level correction approved",
  "data": {
    "request": {
      "id": "uuid",
      "status": "approved",
      "actioned_by": "admin-uuid",
      "actioned_at": "2026-03-18T00:00:00.000Z"
    }
  }
}
```

**Notes:**
- If `approved`, the user's level is automatically updated to `requested_level`
- A request can only be actioned once

---

### 5. Deactivate User (Admin Shortcut)
**PATCH** `/admin/users/:id/deactivate`

No request body needed.

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "User deactivated",
  "data": null
}
```

---

### 6. Delete Announcement (Admin Only)
**DELETE** `/admin/announcements/:id`

No request body needed.

**Success Response `200`:**
```json
{
  "status": "success",
  "message": "Announcement deleted",
  "data": null
}
```

---

## Error Codes

| HTTP Code | Meaning |
|---|---|
| `400` | Bad request — validation failed or invalid input |
| `401` | Unauthorized — missing or expired token |
| `403` | Forbidden — valid token but insufficient role |
| `404` | Not found — resource doesn't exist |
| `409` | Conflict — duplicate (e.g. email already registered) |
| `500` | Internal server error |

---

## Frontend Flow Guide

```
1. Register          → POST /auth/register
2. Verify OTP        → POST /auth/verify-otp
3. Login             → POST /auth/login  → save access_token + refresh_token
4. Check must_reset_password → if true → POST /auth/new-password
5. All requests      → Authorization: Bearer <access_token>
6. Token expired?    → POST /auth/refresh → save new tokens
7. Logout            → POST /auth/logout → clear stored tokens
```
