# Admin Dashboard — Backend Implementation Response

This document summarizes what the backend has implemented in response to **ADMIN_DASHBOARD_BACKEND_REQUIREMENTS.md**. You can share it with the frontend team or stakeholders.

---

## Dashboard endpoint: `GET /api/v1/admin/dashboard`

### Response shape (no wrapper)

The response body matches the structure in **ADMIN_API.md** §4. There is **no** `{ success, data }` wrapper; the endpoint returns the payload directly.

| Field                          | Status | Notes                                                                                            |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------ |
| `metrics`                      | ✅     | `totalUsers`, `totalBusinesses`, `pendingApprovals`, `totalBookings` (can be `null`)             |
| `recentActivity`               | ✅     | Always present                                                                                   |
| `recentActivity.registrations` | ✅     | Array of `{ id, email, role, createdAt }` with optional `firstName`, `lastName` for display name |
| `recentActivity.bookings`      | ✅     | May be `null` or array; optional for UI                                                          |
| `quickActions`                 | ✅     | Array of `{ label, url, count }` (e.g. Approve Spas, View Users, View Bookings)                  |
| `platformGrowth`               | ✅     | Present when available; shape: `{ period, labels, users, bookings, businesses }`                 |
| `activityFeed`                 | ✅     | **Always** an array (never omitted). Items: `{ type, id, date, summary, metadata? }`             |

---

## What the backend provides

### 1. Activity feed (“Recent Activity Feed” card)

- **Endpoint:** Same `GET /api/v1/admin/dashboard`.
- **`activityFeed`** is always returned as an array (empty if no activity).
- Each item: `{ "type": string, "id": string, "date": string (ISO), "summary": string, "metadata"?: object }`.
- **Types used:** `registration`, `booking`, `approval`, `rejection`, `suspended`, `unsuspended`, and raw admin action types from the activity log.
- Feed merges: recent user registrations, recent bookings, and recent admin actions (e.g. business approved, user suspended). Sorted by date (newest first), max 20 items.

### 2. Recent registrations (“Recent User Registration” card)

- **Endpoint:** Same `GET /api/v1/admin/dashboard`.
- **`recentActivity.registrations`** is populated with users from the last 7 days (up to 10).
- Each item: `id`, `email`, `role`, `createdAt`. Optional: `firstName`, `lastName` for display name.

### 3. Platform growth (chart)

- **Endpoint:** Same `GET /api/v1/admin/dashboard`.
- **Optional query param:** `period=7d|30d|90d` (default `7d`).
  - Example: `GET /api/v1/admin/dashboard?period=30d`
- **`platformGrowth`** (when present): `{ period, labels, users, bookings, businesses }` for the requested period.
- Frontend can pass `period` when the user switches tabs (7d / 30d / 90d).

### 4. Monthly revenue card

- **Endpoint:** `GET /api/v1/admin/payments/statistics` (unchanged).
- Returns **`totalRevenue`** (number) for the current month’s successful payments, plus other stats (commission, escrow, etc.).
- Use `totalRevenue` for the “Monthly Revenue” card.

### 5. Quick actions

- **Endpoint:** Same `GET /api/v1/admin/dashboard`.
- **`quickActions`** is populated with links such as “Approve Spas” (with pending count), “View Users”, “View Bookings”.
- If the list is empty, the frontend can fall back to its default links (e.g. Approve Businesses, Manage Categories, Export Report).

---

## Checklist (backend team)

- [x] `GET /admin/dashboard` returns the exact shape in ADMIN_API.md §4 (no wrapper).
- [x] `activityFeed` is implemented and populated so “Recent Activity Feed” can show items.
- [x] `recentActivity.registrations` is implemented and populated; includes optional `firstName`, `lastName`.
- [x] `platformGrowth` is implemented and populated; supports `?period=7d|30d|90d`.
- [x] `GET /admin/payments/statistics` returns `totalRevenue` for the Monthly Revenue card.
- [ ] **(Optional)** Create/Update/Delete/Export user endpoints — not implemented; can be added if full User Management without mock data is required.

---

## Optional / future (not done)

- **Export report:** “Export Report” in Quick Actions remains a placeholder; backend can add an export endpoint (e.g. CSV/Excel) later.
- **User management CRUD/export:** Create user, Update user, Soft delete/Deactivate, Permanent delete, Export users — documented as optional in the requirements; not implemented in this round.

---

_Last updated to reflect current backend implementation._
