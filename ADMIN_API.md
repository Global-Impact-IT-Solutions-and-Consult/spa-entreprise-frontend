# Admin API — Comprehensive Documentation

This document describes **all** admin-only API endpoints for the SPA/Wellness platform. Use it to build the admin dashboard frontend without needing any other reference. Every endpoint requires **admin role** and **JWT authentication**.

---

## Table of contents

1. [Base URL & authentication](#1-base-url--authentication)
2. [Common error responses](#2-common-error-responses)
3. [Enums reference](#3-enums-reference)
4. [Dashboard](#4-dashboard)
5. [User management](#5-user-management)
6. [Business / Spa management](#6-business--spa-management)
7. [Bookings](#7-bookings)
8. [Service categories](#8-service-categories)
9. [Settings](#9-settings)
10. [Activity logs](#10-activity-logs)
11. [Payments](#11-payments)
12. [SMS](#12-sms)

---

## 1. Base URL & authentication

- **Base URL:** `https://<your-api-host>/api/v1`
- **Example:** `https://spa-entreprise-api.onrender.com/api/v1`
- **Admin prefix:** All admin endpoints live under `/api/v1/admin/`.

### Authentication

- **Type:** Bearer JWT.
- **Header:** `Authorization: Bearer <access_token>`
- **How to get the token:** Use the **auth** endpoints (e.g. `POST /api/v1/auth/login`) with an admin user’s credentials. The response includes an `access_token` (or equivalent); send it on every admin request.
- **Role:** The token must belong to a user with role `admin`. Otherwise the API returns **403 Forbidden**.

### Example request

```http
GET /api/v1/admin/dashboard HTTP/1.1
Host: spa-entreprise-api.onrender.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Common error responses

These apply to admin endpoints unless a specific endpoint documents something different.

| Status                        | Meaning                                                      | Typical response body                                            |
| ----------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| **401 Unauthorized**          | Missing or invalid JWT                                       | `{ "statusCode": 401, "message": "Unauthorized" }`               |
| **403 Forbidden**             | Valid JWT but user is not admin                              | `{ "statusCode": 403, "message": "Forbidden resource" }`         |
| **404 Not Found**             | Resource not found (e.g. user, business, booking)            | `{ "statusCode": 404, "message": "User with ID xxx not found" }` |
| **400 Bad Request**           | Validation error or business rule (e.g. “already suspended”) | `{ "statusCode": 400, "message": "User is already suspended" }`  |
| **500 Internal Server Error** | Server error                                                 | `{ "statusCode": 500, "message": "Internal server error" }`      |

Validation errors (e.g. invalid query/body) may return `400` with an array of constraint messages:

```json
{
  "statusCode": 400,
  "message": ["Reason must be at least 20 characters long"],
  "error": "Bad Request"
}
```

---

## 3. Enums reference

Use these values in query params, request bodies, and when interpreting responses.

### UserRole

| Value      | Description    |
| ---------- | -------------- |
| `customer` | Customer       |
| `business` | Business owner |
| `admin`    | Admin          |

### UserStatus

| Value       | Description |
| ----------- | ----------- |
| `active`    | Active user |
| `suspended` | Suspended   |
| `inactive`  | Inactive    |

### BusinessStatus

| Value              | Description       |
| ------------------ | ----------------- |
| `pending_approval` | Awaiting approval |
| `approved`         | Approved          |
| `rejected`         | Rejected          |
| `suspended`        | Suspended         |

### BookingStatus

| Value             | Description      |
| ----------------- | ---------------- |
| `pending_payment` | Awaiting payment |
| `confirmed`       | Confirmed        |
| `completed`       | Completed        |
| `cancelled`       | Cancelled        |
| `expired`         | Expired          |

### PaymentStatus

| Value        | Description |
| ------------ | ----------- |
| `pending`    | Pending     |
| `successful` | Successful  |
| `failed`     | Failed      |
| `refunded`   | Refunded    |

### PaymentMethod

| Value           | Description   |
| --------------- | ------------- |
| `card`          | Card          |
| `bank_transfer` | Bank transfer |
| `mobile_money`  | Mobile money  |
| `other`         | Other         |

---

## 4. Dashboard

### 4.1 Get dashboard metrics

Returns high-level metrics, recent activity, quick actions, optional platform growth chart data, and an activity feed.

**Request**

```http
GET /api/v1/admin/dashboard
Authorization: Bearer <token>
```

No query or body parameters.

**Success response:** `200 OK`

```json
{
  "metrics": {
    "totalUsers": 1250,
    "totalBusinesses": 85,
    "pendingApprovals": 12,
    "totalBookings": 3420
  },
  "recentActivity": {
    "registrations": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "john.doe@example.com",
        "role": "customer",
        "createdAt": "2026-01-31T10:00:00.000Z"
      }
    ],
    "bookings": []
  },
  "quickActions": [
    { "label": "Approve Spas", "url": "/admin/spas/pending", "count": 12 },
    { "label": "View Users", "url": "/admin/users", "count": 1250 },
    { "label": "View Bookings", "url": "/admin/bookings", "count": 3420 }
  ],
  "platformGrowth": {
    "period": "7d",
    "labels": ["Jan 28", "Jan 29", "Jan 30"],
    "users": [5, 12, 8],
    "bookings": [20, 35, 28],
    "businesses": [1, 2, 0]
  },
  "activityFeed": [
    {
      "type": "registration",
      "id": "user-uuid",
      "date": "2026-01-31T10:00:00.000Z",
      "summary": "New customer registered",
      "metadata": { "email": "john@example.com" }
    }
  ]
}
```

- `totalBookings` may be `null` if the feature is not enabled.
- `recentActivity.bookings` may be `null`.
- `platformGrowth` and `activityFeed` may be omitted or `null`.

**Error responses:** `401`, `403` as in [§2](#2-common-error-responses).

---

## 5. User management

### 5.1 Get user list (paginated)

**Request**

```http
GET /api/v1/admin/users?page=1&limit=50&search=john&role=customer&status=active
Authorization: Bearer <token>
```

| Query    | Type   | Required | Default | Description                                                |
| -------- | ------ | -------- | ------- | ---------------------------------------------------------- |
| `page`   | number | No       | 1       | Page number (min 1).                                       |
| `limit`  | number | No       | 50      | Items per page (1–100).                                    |
| `search` | string | No       | —       | Search in email, phone, first name, last name.             |
| `role`   | string | No       | —       | Filter by `UserRole`: `customer`, `business`, `admin`.     |
| `status` | string | No       | —       | Filter by `UserStatus`: `active`, `suspended`, `inactive`. |

**Success response:** `200 OK`

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "phone": "+2348012345678",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "status": "active",
      "createdAt": "2026-01-31T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

**Error responses:** `401`, `403`; `400` if query validation fails.

---

### 5.2 Get user statistics

**Request**

```http
GET /api/v1/admin/users/statistics
Authorization: Bearer <token>
```

**Success response:** `200 OK`

```json
{
  "total": 2847,
  "active": 2312,
  "suspended": 24
}
```

**Error responses:** `401`, `403`.

---

### 5.3 Get user details

**Request**

```http
GET /api/v1/admin/users/:id
Authorization: Bearer <token>
```

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | User UUID.  |

**Success response:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "phone": "+2348012345678",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer",
  "status": "active",
  "emailVerified": true,
  "phoneVerified": false,
  "createdAt": "2026-01-31T10:00:00.000Z",
  "updatedAt": "2026-01-31T10:00:00.000Z",
  "lastLoginAt": "2026-01-31T12:00:00.000Z",
  "business": null,
  "counts": {
    "bookings": 5,
    "reviews": 2
  }
}
```

For a business owner, `business` may look like:

```json
"business": {
  "id": "business-uuid",
  "businessName": "Serenity Spa",
  "status": "approved",
  "city": "Lagos",
  "createdAt": "2026-01-31T10:00:00.000Z"
}
```

**Error responses:** `401`, `403`; `404` if user not found.

---

### 5.4 Suspend user

**Request**

```http
POST /api/v1/admin/users/:id/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Violation of terms of service - inappropriate behavior"
}
```

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | User UUID.  |

**Body**

| Field    | Type   | Required | Constraints | Description            |
| -------- | ------ | -------- | ----------- | ---------------------- |
| `reason` | string | Yes      | 1–500 chars | Reason for suspension. |

**Success response:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "suspended",
  "message": "User suspended successfully"
}
```

**Error responses:**

- `400` — User is already suspended: `"User is already suspended"`.
- `404` — User not found.
- `401`, `403` as usual.

---

### 5.5 Unsuspend user

**Request**

```http
POST /api/v1/admin/users/:id/unsuspend
Authorization: Bearer <token>
```

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | User UUID.  |

No body.

**Success response:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "active",
  "message": "User unsuspended successfully"
}
```

**Error responses:**

- `400` — User is not suspended: `"User is not suspended"`.
- `404` — User not found.
- `401`, `403` as usual.

---

## 6. Business / Spa management

### 6.1 Get business statistics

**Request**

```http
GET /api/v1/admin/spas/statistics
Authorization: Bearer <token>
```

**Success response:** `200 OK`

```json
{
  "pendingApprovals": 12,
  "approved": 168,
  "rejected": 6,
  "allBusinesses": 186
}
```

**Error responses:** `401`, `403`.

---

### 6.2 Get all businesses (paginated, filterable)

**Request**

```http
GET /api/v1/admin/spas?page=1&limit=20&status=approved&businessTypeCode=spa&city=Lagos&sortBy=newest&search=Elegant
Authorization: Bearer <token>
```

| Query              | Type   | Required | Default  | Description                                                      |
| ------------------ | ------ | -------- | -------- | ---------------------------------------------------------------- |
| `page`             | number | No       | 1        | Page number.                                                     |
| `limit`            | number | No       | 20       | Items per page (max 100).                                        |
| `status`           | string | No       | —        | One of: `pending_approval`, `approved`, `rejected`, `suspended`. |
| `businessTypeCode` | string | No       | —        | e.g. `spa`, `barbershop`, `hair_salon`.                          |
| `city`             | string | No       | —        | Filter by city (partial match).                                  |
| `sortBy`           | string | No       | `newest` | `newest`, `oldest`, `name_asc`, `name_desc`.                     |
| `search`           | string | No       | —        | Search in business name or owner email.                          |

**Success response:** `200 OK`

```json
{
  "data": [
    {
      "id": "business-uuid",
      "businessName": "Serenity Spa & Wellness",
      "businessTypeCode": "spa",
      "businessType": { "code": "spa", "name": "Spa & Wellness" },
      "status": "approved",
      "city": "Lagos",
      "address": "123 Victoria Island",
      "phone": "+2348012345678",
      "email": "serenity@example.com",
      "cacNumber": null,
      "coverImage": null,
      "registrationDate": "2026-01-31T10:00:00.000Z",
      "approvedAt": "2026-02-01T09:00:00.000Z",
      "owner": {
        "id": "user-uuid",
        "firstName": "Amina",
        "lastName": "Okafor",
        "email": "amina@example.com",
        "phone": "+2348012345678",
        "userId": "user-uuid"
      },
      "services": [],
      "operatingHours": {},
      "createdAt": "2026-01-31T10:00:00.000Z",
      "updatedAt": "2026-02-01T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 186,
    "page": 1,
    "limit": 20,
    "totalPages": 10
  }
}
```

**Error responses:** `401`, `403`; `400` on validation.

---

### 6.3 Get pending businesses (spas pending approval)

**Request**

```http
GET /api/v1/admin/spas/pending?page=1&limit=50
Authorization: Bearer <token>
```

| Query   | Type   | Required | Default | Description               |
| ------- | ------ | -------- | ------- | ------------------------- |
| `page`  | number | No       | 1       | Page number.              |
| `limit` | number | No       | 50      | Items per page (max 100). |

**Success response:** `200 OK`

```json
{
  "data": [
    {
      "id": "business-uuid",
      "userId": "user-uuid",
      "businessName": "New Spa Ltd",
      "businessTypeCode": "spa",
      "city": "Abuja",
      "status": "pending_approval",
      "createdAt": "2026-02-01T08:00:00.000Z",
      "owner": {
        "email": "owner@example.com",
        "firstName": "Chidi",
        "lastName": "Okeke"
      }
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

**Error responses:** `401`, `403`.

---

### 6.4 Get business details

**Request**

```http
GET /api/v1/admin/spas/:id
Authorization: Bearer <token>
```

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | Business UUID. |

**Success response:** `200 OK`

```json
{
  "id": "business-uuid",
  "businessName": "Serenity Spa & Wellness",
  "businessTypeCode": "spa",
  "businessType": { "code": "spa", "name": "Spa & Wellness" },
  "status": "approved",
  "description": "A luxurious spa...",
  "city": "Lagos",
  "address": "123 Victoria Island",
  "phone": "+2348012345678",
  "email": "serenity@example.com",
  "cacNumber": null,
  "coverImage": null,
  "amenities": ["WiFi", "Parking"],
  "operatingHours": {
    "monday": { "open": "09:00", "close": "18:00", "closed": false }
  },
  "registrationDate": "2026-01-31T10:00:00.000Z",
  "approvedAt": "2026-02-01T09:00:00.000Z",
  "owner": {
    "id": "user-uuid",
    "firstName": "Amina",
    "lastName": "Okafor",
    "email": "amina@example.com",
    "phone": "+2348012345678",
    "userId": "user-uuid",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "services": [
    {
      "id": "service-uuid",
      "name": "Swedish Massage",
      "description": "60 min massage",
      "category": { "id": "cat-uuid", "name": "Massage Therapy" },
      "price": 15000,
      "duration": 60,
      "imageUrl": null
    }
  ],
  "images": [],
  "documents": [],
  "createdAt": "2026-01-31T10:00:00.000Z",
  "updatedAt": "2026-02-01T09:00:00.000Z"
}
```

**Error responses:** `401`, `403`; `404` if business not found.

---

### 6.5 Approve business

**Request**

```http
POST /api/v1/admin/spas/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "All documents verified. Business meets requirements."
}
```

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | Business UUID. |

**Body**

| Field   | Type   | Required | Constraints | Description     |
| ------- | ------ | -------- | ----------- | --------------- |
| `notes` | string | No       | max 500     | Internal notes. |

**Success response:** `200 OK`

```json
{
  "id": "business-uuid",
  "status": "approved",
  "message": "Business approved successfully",
  "approvedAt": "2026-02-01T10:30:00.000Z"
}
```

**Error responses:**

- `400` — Not in `pending_approval`: `"Business is not in pending_approval status. Current status: approved"`.
- `404` — Business not found.
- `401`, `403` as usual.

---

### 6.6 Reject business

**Request**

```http
POST /api/v1/admin/spas/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Incomplete documentation or missing required business license. Please resubmit with all required documents.",
  "sendEmail": true
}
```

| Param | Type   | Description    |
| ----- | ------ | -------------- |
| `id`  | string | Business UUID. |

**Body**

| Field       | Type    | Required | Constraints  | Description                                    |
| ----------- | ------- | -------- | ------------ | ---------------------------------------------- |
| `reason`    | string  | Yes      | 20–500 chars | Rejection reason (shown/sent to owner).        |
| `sendEmail` | boolean | No       | —            | Send rejection email to owner (default: true). |

**Success response:** `200 OK`

```json
{
  "id": "business-uuid",
  "status": "rejected",
  "message": "Business rejected successfully",
  "rejectedAt": "2026-02-01T10:30:00.000Z"
}
```

**Error responses:**

- `400` — Not in `pending_approval` (same message pattern as approve); or validation: e.g. `"Reason must be at least 20 characters long"`.
- `404` — Business not found.
- `401`, `403` as usual.

---

## 7. Bookings

### 7.1 Get booking statistics

**Request**

```http
GET /api/v1/admin/bookings/statistics
Authorization: Bearer <token>
```

**Success response:** `200 OK`

```json
{
  "total": 5231,
  "pending": 187,
  "completed": 3892,
  "confirmed": 800,
  "cancelled": 300,
  "expired": 52
}
```

**Error responses:** `401`, `403`.

---

### 7.2 Get booking list (paginated, filterable)

**Request**

```http
GET /api/v1/admin/bookings?page=1&limit=20&status=confirmed&dateFrom=2023-10-01&dateTo=2023-10-31&businessId=uuid&customerId=uuid&sortBy=newest
Authorization: Bearer <token>
```

| Query        | Type   | Required | Default  | Description                                                                  |
| ------------ | ------ | -------- | -------- | ---------------------------------------------------------------------------- |
| `page`       | number | No       | 1        | Page number.                                                                 |
| `limit`      | number | No       | 20       | Items per page (1–100).                                                      |
| `status`     | string | No       | —        | One of: `pending_payment`, `confirmed`, `completed`, `cancelled`, `expired`. |
| `dateFrom`   | string | No       | —        | ISO date (booking date).                                                     |
| `dateTo`     | string | No       | —        | ISO date (booking date).                                                     |
| `businessId` | string | No       | —        | UUID.                                                                        |
| `customerId` | string | No       | —        | UUID.                                                                        |
| `sortBy`     | string | No       | `newest` | `newest`, `oldest`, `date_asc`, `date_desc`.                                 |

**Success response:** `200 OK`

```json
{
  "data": [
    {
      "id": "booking-uuid",
      "customerName": "John Doe",
      "customerId": "customer-uuid",
      "businessName": "Serenity Spa",
      "businessId": "business-uuid",
      "serviceName": "Swedish Massage",
      "dateTime": "2026-02-15 • 10:00",
      "amount": 15000,
      "status": "confirmed",
      "paymentStatus": "successful",
      "createdAt": "2026-02-01T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5231,
    "page": 1,
    "limit": 20,
    "totalPages": 262
  }
}
```

**Error responses:** `401`, `403`; `400` on validation.

---

### 7.3 Get booking detail

**Request**

```http
GET /api/v1/admin/bookings/:id
Authorization: Bearer <token>
```

| Param | Type   | Description   |
| ----- | ------ | ------------- |
| `id`  | string | Booking UUID. |

**Success response:** `200 OK`

```json
{
  "id": "booking-uuid",
  "status": "confirmed",
  "customer": {
    "id": "customer-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678"
  },
  "businessAndService": {
    "businessId": "business-uuid",
    "businessName": "Serenity Spa",
    "serviceId": "service-uuid",
    "serviceName": "Swedish Massage",
    "duration": 60,
    "staffName": null
  },
  "schedule": {
    "date": "2026-02-15",
    "time": "10:00",
    "bookedOn": "2026-02-01T09:00:00.000Z"
  },
  "payment": {
    "amount": 15000,
    "currency": "NGN",
    "paymentStatus": "successful",
    "paymentMethod": "card",
    "transactionId": "txn-123"
  }
}
```

**Error responses:** `401`, `403`; `404` if booking not found.

---

## 8. Service categories

### 8.1 Get service categories (admin list)

Paginated list of service categories with usage count and stats.

**Request**

```http
GET /api/v1/admin/service-categories?page=1&limit=20&status=all&sortBy=name_asc&search=massage
Authorization: Bearer <token>
```

| Query    | Type   | Required | Default    | Description                                  |
| -------- | ------ | -------- | ---------- | -------------------------------------------- |
| `page`   | number | No       | 1          | Page number.                                 |
| `limit`  | number | No       | 20         | Items per page.                              |
| `status` | string | No       | `all`      | `all`, `active`, `inactive`.                 |
| `sortBy` | string | No       | `name_asc` | `name_asc`, `name_desc`, `newest`, `oldest`. |
| `search` | string | No       | —          | Search in name or description.               |

**Success response:** `200 OK`

```json
{
  "data": [
    {
      "id": "category-uuid",
      "name": "Massage Therapy",
      "description": "Various massage techniques...",
      "usageCount": 42,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 32,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  },
  "stats": {
    "total": 32,
    "active": 30
  }
}
```

**Error responses:** `401`, `403`; `400` on validation.

---

## 9. Settings

### 9.1 Get notification preferences

**Request**

```http
GET /api/v1/admin/settings/notifications
Authorization: Bearer <token>
```

**Success response:** `200 OK`

```json
{
  "newUserRegistration": true,
  "businessApprovalRequests": true,
  "newBookings": true,
  "paymentDisputes": false,
  "systemUpdates": true
}
```

**Error responses:** `401`, `403`.

---

### 9.2 Update notification preferences

**Request**

```http
PATCH /api/v1/admin/settings/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "newUserRegistration": true,
  "businessApprovalRequests": true,
  "newBookings": true,
  "paymentDisputes": false,
  "systemUpdates": true
}
```

**Body:** All fields optional (only send fields to update).

| Field                      | Type    | Description                            |
| -------------------------- | ------- | -------------------------------------- |
| `newUserRegistration`      | boolean | Notify on new user registration.       |
| `businessApprovalRequests` | boolean | Notify on business approval requests.  |
| `newBookings`              | boolean | Notify on new bookings.                |
| `paymentDisputes`          | boolean | Alerts for payment disputes.           |
| `systemUpdates`            | boolean | Platform maintenance / system updates. |

**Success response:** `200 OK`

Same shape as [§9.1](#91-get-notification-preferences) (full preferences object).

**Error responses:** `401`, `403`; `400` on validation.

---

### 9.3 Get active sessions (stub)

Returns current session only (stub for future multi-session support).

**Request**

```http
GET /api/v1/admin/settings/sessions
Authorization: Bearer <token>
```

**Success response:** `200 OK`

```json
[
  {
    "id": "current",
    "device": "Current device",
    "location": "Current session",
    "lastActive": "2024-01-15T10:00:00.000Z",
    "current": true,
    "canRevoke": false
  }
]
```

**Error responses:** `401`, `403`.

---

## 10. Activity logs

### 10.1 Get activity logs (paginated)

**Request**

```http
GET /api/v1/admin/activity-logs?page=1&limit=20&actionType=user_suspended&dateFrom=2023-10-01&dateTo=2023-10-31&search=Elegant
Authorization: Bearer <token>
```

| Query        | Type   | Required | Default | Description                                                                          |
| ------------ | ------ | -------- | ------- | ------------------------------------------------------------------------------------ |
| `page`       | number | No       | 1       | Page number.                                                                         |
| `limit`      | number | No       | 20      | Items per page (1–100).                                                              |
| `actionType` | string | No       | —       | e.g. `user_suspended`, `business_approved`, `business_rejected`, `user_unsuspended`. |
| `dateFrom`   | string | No       | —       | ISO date.                                                                            |
| `dateTo`     | string | No       | —       | ISO date.                                                                            |
| `search`     | string | No       | —       | Search in action, details, admin email.                                              |

**Success response:** `200 OK`

```json
{
  "data": [
    {
      "timestamp": "2023-10-18T09:32:15.000Z",
      "admin": "admin@wellnessbeauty.com",
      "action": "User Suspended",
      "details": "Suspended user \"mike@email.com\" (ID: xxx) - reason: multiple failed logins",
      "ipAddress": "192.168.1.45",
      "status": "success"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Error responses:** `401`, `403`; `400` on validation.

---

## 11. Payments

### 11.1 Get payment statistics

**Request**

```http
GET /api/v1/admin/payments/statistics
Authorization: Bearer <token>
```

**Success response:** `200 OK`

```json
{
  "totalRevenue": 4852500,
  "totalCommission": 485250,
  "commissionPercent": 10,
  "escrowBalance": 0,
  "disputedAmount": 0,
  "disputedCount": 0,
  "revenuePercentChangeFromLastMonth": 15.3
}
```

`revenuePercentChangeFromLastMonth` may be `null` if not computable.

**Error responses:** `401`, `403`.

---

### 11.2 Get revenue trend (chart)

**Request**

```http
GET /api/v1/admin/payments/trend?period=7d
Authorization: Bearer <token>
```

| Query    | Type   | Required | Default | Description         |
| -------- | ------ | -------- | ------- | ------------------- |
| `period` | string | No       | `7d`    | `7d`, `30d`, `90d`. |

**Success response:** `200 OK`

```json
{
  "period": "7d",
  "labels": ["Jan 28", "Jan 29", "Jan 30", "Jan 31", "Feb 1", "Feb 2", "Feb 3"],
  "revenue": [120000, 185000, 95000, 210000, 0, 150000, 175000]
}
```

**Error responses:** `401`, `403`.

---

### 11.3 Get payment methods distribution

**Request**

```http
GET /api/v1/admin/payments/methods
Authorization: Bearer <token>
```

**Success response:** `200 OK`

```json
{
  "card": 65,
  "bank_transfer": 25,
  "mobile_money": 5,
  "other": 5
}
```

Values are percentages (sum = 100).

**Error responses:** `401`, `403`.

---

### 11.4 Get payment list (paginated, filterable)

**Request**

```http
GET /api/v1/admin/payments?page=1&limit=20&status=successful&dateFrom=2023-10-01&dateTo=2023-10-31&businessId=uuid&customerId=uuid&sortBy=newest
Authorization: Bearer <token>
```

| Query        | Type   | Required | Default  | Description                                    |
| ------------ | ------ | -------- | -------- | ---------------------------------------------- |
| `page`       | number | No       | 1        | Page number.                                   |
| `limit`      | number | No       | 20       | Items per page (1–100).                        |
| `status`     | string | No       | —        | `pending`, `successful`, `failed`, `refunded`. |
| `dateFrom`   | string | No       | —        | ISO date.                                      |
| `dateTo`     | string | No       | —        | ISO date.                                      |
| `businessId` | string | No       | —        | UUID.                                          |
| `customerId` | string | No       | —        | UUID.                                          |
| `sortBy`     | string | No       | `newest` | `newest`, `oldest`.                            |

**Success response:** `200 OK`

```json
{
  "data": [
    {
      "id": "payment-uuid",
      "transactionId": "flw-txn-123",
      "customerName": "John Doe",
      "businessName": "Serenity Spa",
      "method": "card",
      "paymentStatus": "successful",
      "escrowStatus": "Released",
      "dateTime": "2026-02-01 • 14:30",
      "amount": 15000,
      "createdAt": "2026-02-01T14:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1200,
    "page": 1,
    "limit": 20,
    "totalPages": 60
  }
}
```

`escrowStatus` can be: `Released`, `Refunded`, `Held`, or `—`.

**Error responses:** `401`, `403`; `400` on validation.

---

### 11.5 Get payment detail

**Request**

```http
GET /api/v1/admin/payments/:id
Authorization: Bearer <token>
```

| Param | Type   | Description   |
| ----- | ------ | ------------- |
| `id`  | string | Payment UUID. |

**Success response:** `200 OK`

```json
{
  "id": "payment-uuid",
  "transactionId": "flw-txn-123",
  "customerId": "customer-uuid",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+2348012345678",
  "businessId": "business-uuid",
  "businessName": "Serenity Spa",
  "bookingId": "booking-uuid",
  "amount": 15000,
  "currency": "NGN",
  "status": "successful",
  "paymentMethod": "card",
  "flwTransactionId": "flw-txn-123",
  "createdAt": "2026-02-01T14:30:00.000Z",
  "errorMessage": null
}
```

**Error responses:** `401`, `403`; `404` if payment not found.

---

## 12. SMS

### 12.1 Send SMS to one user

**Request**

```http
POST /api/v1/admin/sms/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+2348012345678",
  "message": "Your booking has been confirmed. Thank you!"
}
```

**Body**

| Field     | Type   | Required | Constraints                | Description           |
| --------- | ------ | -------- | -------------------------- | --------------------- |
| `phone`   | string | Yes      | 10–15 digits, optional `+` | International format. |
| `message` | string | Yes      | Non-empty                  | SMS content.          |

**Success response:** `200 OK`

```json
{
  "success": true,
  "messageId": "msg-123456",
  "message": "SMS sent successfully"
}
```

**Error response (failure):** `200 OK` (check `success: false`)

```json
{
  "success": false,
  "error": "Invalid phone number",
  "message": "Invalid phone number"
}
```

**Error responses:** `400` (e.g. invalid phone format); `401`, `403`.

---

### 12.2 Send bulk SMS

**Request**

```http
POST /api/v1/admin/sms/send-bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "phones": ["+2348012345678", "+2348023456789"],
  "message": "Your booking has been confirmed. Thank you!"
}
```

**Body**

| Field     | Type     | Required | Constraints                     | Description    |
| --------- | -------- | -------- | ------------------------------- | -------------- |
| `phones`  | string[] | Yes      | At least one; each 10–15 digits | Phone numbers. |
| `message` | string   | Yes      | Non-empty                       | SMS content.   |

**Success response:** `200 OK`

```json
{
  "success": 2,
  "failed": 0,
  "results": [
    { "phone": "+2348012345678", "success": true },
    { "phone": "+2348023456789", "success": true }
  ]
}
```

Each item in `results` may include `error` when `success` is false for that phone.

**Error responses:** `400` (e.g. empty array or invalid phones); `401`, `403`.

---

## Quick reference: all admin endpoints

| Method | Path                            | Description                     |
| ------ | ------------------------------- | ------------------------------- |
| GET    | `/admin/dashboard`              | Dashboard metrics and activity  |
| GET    | `/admin/users`                  | User list (paginated)           |
| GET    | `/admin/users/statistics`       | User stats                      |
| GET    | `/admin/users/:id`              | User details                    |
| POST   | `/admin/users/:id/suspend`      | Suspend user                    |
| POST   | `/admin/users/:id/unsuspend`    | Unsuspend user                  |
| GET    | `/admin/spas/statistics`        | Business stats                  |
| GET    | `/admin/spas`                   | All businesses (paginated)      |
| GET    | `/admin/spas/pending`           | Pending businesses              |
| GET    | `/admin/spas/:id`               | Business details                |
| POST   | `/admin/spas/:id/approve`       | Approve business                |
| POST   | `/admin/spas/:id/reject`        | Reject business                 |
| GET    | `/admin/bookings/statistics`    | Booking stats                   |
| GET    | `/admin/bookings`               | Booking list (paginated)        |
| GET    | `/admin/bookings/:id`           | Booking detail                  |
| GET    | `/admin/service-categories`     | Service categories (admin)      |
| GET    | `/admin/settings/notifications` | Get notification preferences    |
| PATCH  | `/admin/settings/notifications` | Update notification preferences |
| GET    | `/admin/settings/sessions`      | Active sessions (stub)          |
| GET    | `/admin/activity-logs`          | Activity logs (paginated)       |
| GET    | `/admin/payments/statistics`    | Payment stats                   |
| GET    | `/admin/payments/trend`         | Revenue trend                   |
| GET    | `/admin/payments/methods`       | Payment methods distribution    |
| GET    | `/admin/payments`               | Payment list (paginated)        |
| GET    | `/admin/payments/:id`           | Payment detail                  |
| POST   | `/admin/sms/send`               | Send single SMS                 |
| POST   | `/admin/sms/send-bulk`          | Send bulk SMS                   |

All paths are relative to base URL: `https://<host>/api/v1`.

---

_End of Admin API documentation._
