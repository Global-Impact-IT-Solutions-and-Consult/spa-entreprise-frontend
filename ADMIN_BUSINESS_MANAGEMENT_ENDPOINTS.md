# Admin Business Management Endpoints

This document provides comprehensive API endpoints for the Admin Business/SPA Management dashboard. All endpoints require **Admin authentication** (JWT token with `ADMIN` role).

**Base URL:** `/api/v1/admin`

**Authentication:** All endpoints require `Authorization: Bearer <JWT_TOKEN>` header with admin role.

---

## 1. Business Statistics

Get summary statistics for the business management dashboard.

### Endpoint
```
GET /admin/spas/statistics
```

### Description
Returns counts for pending approvals, approved, rejected, and all businesses.

### Response
```json
{
  "pendingApprovals": 12,
  "approved": 168,
  "rejected": 6,
  "allBusinesses": 186
}
```

### Status Codes
- `200 OK` - Statistics retrieved successfully
- `403 Forbidden` - Admin access required
- `401 Unauthorized` - Invalid or missing token

---

## 2. Get All Businesses (with Filters)

Get paginated list of all businesses with filtering and sorting options.

### Endpoint
```
GET /admin/spas
```

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 20, max: 100) | `20` |
| `status` | string | No | Filter by status: `pending_approval`, `approved`, `rejected`, `suspended` | `pending_approval` |
| `businessTypeCode` | string | No | Filter by business type: `spa`, `barbershop`, `salon`, etc. | `spa` |
| `city` | string | No | Filter by city name | `Lagos` |
| `sortBy` | string | No | Sort field: `newest`, `oldest`, `name_asc`, `name_desc` (default: `newest`) | `newest` |
| `search` | string | No | Search by business name or owner email | `Elegant Spa` |

### Response
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "businessName": "Elegant Spa & Beauty",
      "businessTypeCode": "spa",
      "businessType": {
        "code": "spa",
        "name": "SPA Center"
      },
      "status": "pending_approval",
      "city": "Lagos",
      "address": "123 Wellness Street, Victoria Island",
      "phone": "+2348012345678",
      "email": "info@elegantspa.com",
      "cacNumber": "BN 23456789",
      "coverImage": "https://res.cloudinary.com/...",
      "registrationDate": "2023-10-14T00:00:00Z",
      "approvedAt": null,
      "owner": {
        "id": "user-id",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah.j@elegantspa.com",
        "phone": "+234 801 234 5678",
        "userId": "USR-78901"
      },
      "services": [
        {
          "id": "service-id-1",
          "name": "Swedish Massage",
          "category": {
            "id": "category-id",
            "name": "Massage Therapy"
          }
        },
        {
          "id": "service-id-2",
          "name": "Deep Tissue Massage",
          "category": {
            "id": "category-id",
            "name": "Massage Therapy"
          }
        }
      ],
      "operatingHours": {
        "monday": { "open": "09:00", "close": "18:00", "closed": false },
        "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
        "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
        "thursday": { "open": "09:00", "close": "18:00", "closed": false },
        "friday": { "open": "09:00", "close": "18:00", "closed": false },
        "saturday": { "open": "10:00", "close": "16:00", "closed": false },
        "sunday": { "closed": true }
      },
      "createdAt": "2023-10-14T00:00:00Z",
      "updatedAt": "2023-10-14T00:00:00Z"
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

### Status Codes
- `200 OK` - Businesses retrieved successfully
- `403 Forbidden` - Admin access required
- `401 Unauthorized` - Invalid or missing token

---

## 3. Get Business Details

Get comprehensive details of a specific business including owner information and services.

### Endpoint
```
GET /admin/spas/:id
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Business ID |

### Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "businessName": "Elegant Spa & Beauty",
  "businessTypeCode": "spa",
  "businessType": {
    "code": "spa",
    "name": "SPA Center"
  },
  "status": "pending_approval",
  "description": "A luxurious spa offering a wide range of wellness services including massage therapy, facial treatments, and body scrubs.",
  "city": "Lagos",
  "address": "123 Wellness Street, Victoria Island, Lagos",
  "phone": "+2348012345678",
  "email": "info@elegantspa.com",
  "cacNumber": "BN 34567890",
  "coverImage": "https://res.cloudinary.com/...",
  "amenities": ["WiFi", "Parking", "Air Conditioning"],
  "operatingHours": {
    "monday": { "open": "09:00", "close": "18:00", "closed": false },
    "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
    "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
    "thursday": { "open": "09:00", "close": "18:00", "closed": false },
    "friday": { "open": "09:00", "close": "18:00", "closed": false },
    "saturday": { "open": "10:00", "close": "16:00", "closed": false },
    "sunday": { "closed": true }
  },
  "registrationDate": "2023-10-15T00:00:00Z",
  "approvedAt": null,
  "owner": {
    "id": "user-id",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.j@elegantspa.com",
    "phone": "+234 801 234 5678",
    "userId": "USR-78901",
    "createdAt": "2023-10-01T00:00:00Z"
  },
  "services": [
    {
      "id": "service-id-1",
      "name": "Swedish Massage",
      "description": "A relaxing full-body massage",
      "category": {
        "id": "category-id",
        "name": "Massage Therapy"
      },
      "price": 15000,
      "duration": 60,
      "imageUrl": "https://res.cloudinary.com/..."
    },
    {
      "id": "service-id-2",
      "name": "Deep Tissue Massage",
      "description": "Intensive massage for muscle tension",
      "category": {
        "id": "category-id",
        "name": "Massage Therapy"
      },
      "price": 20000,
      "duration": 90,
      "imageUrl": "https://res.cloudinary.com/..."
    },
    {
      "id": "service-id-3",
      "name": "Aromatherapy",
      "description": "Therapeutic massage with essential oils",
      "category": {
        "id": "category-id",
        "name": "Massage Therapy"
      },
      "price": 18000,
      "duration": 75,
      "imageUrl": null
    }
  ],
  "images": [
    {
      "id": "image-id-1",
      "url": "https://res.cloudinary.com/...",
      "caption": "Main entrance",
      "category": "gallery",
      "isPrimary": true,
      "displayOrder": 1
    }
  ],
  "documents": [
    {
      "id": "doc-id-1",
      "type": "business_license",
      "status": "approved",
      "url": "https://res.cloudinary.com/...",
      "uploadedAt": "2023-10-14T00:00:00Z"
    }
  ],
  "createdAt": "2023-10-15T00:00:00Z",
  "updatedAt": "2023-10-15T00:00:00Z"
}
```

### Status Codes
- `200 OK` - Business details retrieved successfully
- `404 Not Found` - Business not found
- `403 Forbidden` - Admin access required
- `401 Unauthorized` - Invalid or missing token

---

## 4. Approve Business Registration

Approve a pending business registration.

### Endpoint
```
POST /admin/spas/:id/approve
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Business ID |

### Request Body
```json
{
  "notes": "All documents verified. Business meets requirements." // Optional: Internal notes
}
```

### Request Body Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | No | Optional internal notes for reference (max 500 characters) |

### Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "approved",
  "message": "Business approved successfully",
  "approvedAt": "2023-10-16T10:30:00Z"
}
```

### Status Codes
- `200 OK` - Business approved successfully
- `400 Bad Request` - Business is not in pending_approval status
- `404 Not Found` - Business not found
- `403 Forbidden` - Admin access required
- `401 Unauthorized` - Invalid or missing token

### Notes
- Business owner will be automatically notified via email
- Business status changes from `pending_approval` to `approved`
- `approvedAt` timestamp is set
- Business becomes visible in public listings after approval

---

## 5. Reject Business Registration

Reject a pending business registration with a reason.

### Endpoint
```
POST /admin/spas/:id/reject
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Business ID |

### Request Body
```json
{
  "reason": "Incomplete documentation or missing required business license. Please resubmit with all required documents.",
  "sendEmail": true // Optional: Whether to send rejection email (default: true)
}
```

### Request Body Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | Reason for rejection (min 20 characters, max 500 characters) |
| `sendEmail` | boolean | No | Whether to send rejection email to business owner (default: `true`) |

### Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "rejected",
  "message": "Business rejected successfully",
  "rejectedAt": "2023-10-16T10:30:00Z"
}
```

### Status Codes
- `200 OK` - Business rejected successfully
- `400 Bad Request` - Business is not in pending_approval status, or reason is too short
- `404 Not Found` - Business not found
- `403 Forbidden` - Admin access required
- `401 Unauthorized` - Invalid or missing token

### Validation Rules
- `reason` must be at least 20 characters long
- `reason` must not exceed 500 characters
- Business must be in `pending_approval` status

### Notes
- Business owner will be notified via email (if `sendEmail` is `true`)
- Rejection reason is included in the email
- Business status changes from `pending_approval` to `rejected`
- Rejected businesses cannot be approved (would need re-registration)

---

## 6. Get Pending Businesses

Get paginated list of businesses pending approval.

### Endpoint
```
GET /admin/spas/pending
```

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 50, max: 100) | `50` |

### Response
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "businessName": "Elegant Spa & Beauty",
      "businessTypeCode": "spa",
      "city": "Lagos",
      "status": "pending_approval",
      "registrationDate": "2023-10-14T00:00:00Z",
      "owner": {
        "email": "sarah.j@elegantspa.com",
        "firstName": "Sarah",
        "lastName": "Johnson"
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

### Status Codes
- `200 OK` - Pending businesses retrieved successfully
- `403 Forbidden` - Admin access required
- `401 Unauthorized` - Invalid or missing token

---

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "statusCode": 400,
  "timestamp": "2026-02-07T14:47:25.141Z",
  "path": "/api/v1/admin/spas/:id/approve",
  "method": "POST",
  "message": "Business is not in pending_approval status",
  "requestId": "req-1770475645129-n71x3792n"
}
```

### Common Error Status Codes
- `400 Bad Request` - Validation error or invalid request
- `401 Unauthorized` - Invalid or missing authentication token
- `403 Forbidden` - User does not have admin role
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Implementation Notes

### Filtering and Sorting

**Status Filter:**
- `pending_approval` - Businesses awaiting admin review
- `approved` - Businesses that have been approved
- `rejected` - Businesses that have been rejected
- `suspended` - Businesses that have been suspended

**Business Type Filter:**
- Filter by `businessTypeCode` (e.g., `spa`, `barbershop`, `salon`)
- Use the business type code from the business type enum

**City Filter:**
- Filter by city name (case-insensitive partial match)
- Uses the `city` field from the business entity

**Sort Options:**
- `newest` - Sort by creation date descending (newest first)
- `oldest` - Sort by creation date ascending (oldest first)
- `name_asc` - Sort by business name A-Z
- `name_desc` - Sort by business name Z-A

### Pagination

- Default page size: 20 items
- Maximum page size: 100 items
- Page numbers start at 1
- Response includes pagination metadata

### Owner Information

Owner information is included in business responses and includes:
- User ID
- First name and last name
- Email address
- Phone number
- User creation date

### Services Information

Services are included in business detail responses and include:
- Service ID, name, description
- Category information
- Price and duration
- Image URL (if available)

---

## Frontend Integration Guide

### 1. Dashboard Statistics

```javascript
// Get statistics for dashboard cards
const response = await fetch('/api/v1/admin/spas/statistics', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const stats = await response.json();
// Use: stats.pendingApprovals, stats.approved, stats.rejected, stats.allBusinesses
```

### 2. Business List with Filters

```javascript
// Get businesses with filters
const params = new URLSearchParams({
  page: '1',
  limit: '20',
  status: 'pending_approval', // or 'approved', 'rejected', 'suspended'
  businessTypeCode: 'spa', // optional
  city: 'Lagos', // optional
  sortBy: 'newest', // or 'oldest', 'name_asc', 'name_desc'
  search: 'Elegant' // optional search term
});

const response = await fetch(`/api/v1/admin/spas?${params}`, {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const data = await response.json();
// Use: data.data for business list, data.pagination for pagination info
```

### 3. View Business Details

```javascript
// Get full business details
const response = await fetch(`/api/v1/admin/spas/${businessId}`, {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const business = await response.json();
// Display business details, owner info, services, etc.
```

### 4. Approve Business

```javascript
// Approve a business
const response = await fetch(`/api/v1/admin/spas/${businessId}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    notes: 'All documents verified. Business meets requirements.' // optional
  })
});
const result = await response.json();
// Show success message: result.message
```

### 5. Reject Business

```javascript
// Reject a business
const response = await fetch(`/api/v1/admin/spas/${businessId}/reject`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'Incomplete documentation or missing required business license. Please resubmit with all required documents.',
    sendEmail: true // optional, default: true
  })
});
const result = await response.json();
// Show success message: result.message
```

---

## Implementation Status

All endpoints have been implemented and are ready for use:

1. ✅ **GET /admin/spas/statistics** - Business statistics (pending, approved, rejected, all) - **IMPLEMENTED**
2. ✅ **GET /admin/spas** - Get all businesses with filters (status, type, city, sort, search) - **IMPLEMENTED**
3. ✅ **GET /admin/spas/:id** - Get business details (enhanced version with owner, services, images, documents) - **IMPLEMENTED**
4. ✅ **POST /admin/spas/:id/approve** - Approve business (supports optional notes) - **IMPLEMENTED**
5. ✅ **POST /admin/spas/:id/reject** - Reject business (supports sendEmail option and minimum 20 character reason) - **IMPLEMENTED**
6. ✅ **GET /admin/spas/pending** - Get pending businesses - **ALREADY EXISTS**

---

## Testing Notes

- All endpoints require admin authentication
- Test with different filter combinations
- Verify pagination works correctly
- Test approve/reject with and without optional fields
- Ensure email notifications are sent when appropriate

