# Fundsroom Mini ERP + CRM

A basic ERP + CRM portal built for the Fundsroom Full Stack Developer take-home assignment. Includes JWT-based authentication with 4 roles, a Customer CRM module, a Product & Inventory module, and a Sales Challan module with real stock-deduction logic.

---

## Live Demo

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [https://fundsroom-erp-alpha.vercel.app](https://fundsroom-erp-alpha.vercel.app) |
| Backend API | Render | [https://fundsroom-erp-ttnj.onrender.com](https://fundsroom-erp-ttnj.onrender.com) |

> **Note:** The backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30-60 seconds to respond while the server wakes up — this is expected, not a bug.

Use the test credentials below to log in and explore all 4 modules.

---

## Tech Stack

- **Backend:** Node.js, TypeScript, Express, PostgreSQL (hosted on [Neon](https://neon.tech))
- **Frontend:** React (Vite), TypeScript, react-router-dom, axios
- **Auth:** JWT + bcrypt password hashing

---

## Project Structure

```
Fundsroom-ERP/
├── backend/
│   └── src/
│       ├── config/db.ts          # PostgreSQL connection pool
│       ├── controllers/          # auth, customer, product, challan
│       ├── routes/                # route definitions per module
│       ├── app.ts                 # wires all routes
│       └── server.ts              # entry point
└── frontend/
    └── src/
        ├── pages/                 # Login, Dashboard, Customers, Products, Challans
        ├── components/            # ProtectedRoute
        ├── services/api.ts        # axios instance with JWT auto-attach
        └── App.tsx                # route definitions
```

---

## Setup Instructions

### Prerequisites
- Node.js installed
- A PostgreSQL database (this project used a free Neon instance)

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with:
```
DATABASE_URL=<your PostgreSQL connection string>
PORT=5000
JWT_SECRET=<any long random string>
```

Run the database schema (see **Database Schema** below) against your PostgreSQL instance, then start the server:
```bash
npm run dev
```
Backend runs on `http://localhost:5000`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

> Both servers must be running simultaneously, in separate terminals.

---

## Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `DATABASE_URL` | `backend/.env` | Neon PostgreSQL connection string |
| `PORT` | `backend/.env` | Backend server port (default 5000) |
| `JWT_SECRET` | `backend/.env` | Secret used to sign/verify JWTs |

`.env` is not committed to version control. Anyone running this project locally must create their own `backend/.env` file with the variables above.

---

## Database Schema (summary)

Five tables: `users`, `customers`, `products`, `challans`, `stock_movements`.

- **users** — id, name, email, password (hashed), role (Admin / Sales / Warehouse / Accounts)
- **customers** — id, name, mobile, and other CRM fields
- **products** — id, name, sku, category, unit_price, current_stock, min_stock_alert, location
- **challans** — id, challan_number, customer_id, products (JSONB array of `{product_id, quantity}`), total_quantity, status (Draft/Confirmed), created_by, created_at
- **stock_movements** — id, product_id, quantity, movement_type (IN/OUT), reason, created_by, created_at — an audit log of every stock change, written whenever a challan is confirmed

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@fundsroom.com | admin123 |
| Sales | sales@fundsroom.com | sales123 |
| Warehouse | warehouse@fundsroom.com | warehouse123 |
| Accounts | accounts@fundsroom.com | accounts123 |

---

## API Endpoints (summary)

**Auth**
- `POST /auth/register` — create a user (name, email, password, role)
- `POST /auth/login` — returns JWT token

**Customers**
- `POST /customers` — create
- `GET /customers` — list (supports search & pagination)
- `GET /customers/:id` — get one
- `PUT /customers/:id` — update

**Products**
- `POST /products` — create
- `GET /products` — list (supports search & pagination)
- `PUT /products/:id` — update
- `GET /products/:id/movements` — audit trail of stock changes for a product

**Challans**
- `POST /challans` — create a challan as a **Draft**. Does not touch stock yet.
- `POST /challans/:id/confirm` — confirms a Draft challan. Validates stock availability for every line item inside a database transaction (with row-level locking via `SELECT ... FOR UPDATE`); if any product has insufficient stock, the entire request is rejected and rolled back (no partial updates, no negative stock). On success, deducts `current_stock` for each product, logs each deduction to `stock_movements`, and marks the challan `Confirmed`.
- `GET /challans` — list (paginated)
- `GET /challans/:id` — get one

A Postman collection (`Fundsroom-ERP.postman_collection.json`) is included in the repository root for testing all endpoints directly.

---

## Assumptions Made

- All 4 roles can currently access all modules — the API does not yet enforce per-role permissions on top of authentication (see Known Limitations).
- Challans are created directly with a `products` array of `{product_id, quantity}` supplied by the frontend; product price/name are looked up server-side rather than being trusted from the client.
- A challan's `status` starts as `Draft` and only moves to `Confirmed` (with stock deducted) via the separate confirm endpoint — matching the assignment's required Draft → Confirmed business flow.
- Given the assignment's time constraint, **Option B** was chosen initially: build all 4 modules to a working, tested, basic-CRUD standard rather than building one module in full depth. The Draft → Confirm workflow and stock movement log were added as a follow-up iteration once core CRUD and deployment were stable.

---

## Known Limitations

This submission was built under a tight time constraint. In the interest of transparency:

- **Role-based access control is not enforced on the backend.** All 4 roles can log in and reach all modules; there is no middleware yet restricting actions by role (e.g., a Sales user could technically perform an action intended for Admin only).
- **A few optional customer fields are not implemented:** GST number, follow-up date, and a dedicated customer detail/profile page were deprioritized in favor of core CRUD.
- **No automated tests** (unit or integration) are included.
- **Frontend UI is functional but visually basic** — the priority was working, correct business logic over visual polish, given the time available.

**What is fully implemented and tested:** JWT authentication for all 4 roles, full CRUD for Customers and Products, a complete **Draft → Confirm Sales Challan workflow** where stock is only deducted on confirmation, a **stock movement audit log** recorded transactionally alongside every deduction, protected frontend routes, product snapshotting inside challans, and transactional stock validation that checks every line item before committing, rejects the whole request with a clear error if any item has insufficient stock, and never leaves stock partially updated.

---

## Architecture Overview

The system follows a standard 3-tier architecture: a React (Vite + TypeScript) frontend communicates via REST APIs (axios) with a Node.js/Express/TypeScript backend, which connects to a PostgreSQL database (hosted on Neon). Authentication uses JWT tokens issued on login and verified on protected routes, with the frontend guarding routes client-side. The backend is organized by module (Auth, Customers, Products, Challans), each with its own controller and route file, using raw parameterized SQL queries.

The centerpiece of the business logic is in the Challans module: creating a challan runs as a Draft with no stock impact. Confirming it runs inside a single PostgreSQL transaction that checks stock availability for every line item with row-level locking, rejects and rolls back the entire request if any item has insufficient stock, and only then deducts stock, logs the movement, and marks the challan Confirmed — guaranteeing no partial updates and no negative stock under any circumstance.

---

## Deployment

The project is deployed and live (see **Live Demo** section above):

- **Backend** — deployed on [Render](https://render.com), Node/Express web service, root directory `backend`, environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`) configured in the Render dashboard rather than committed to the repo.
- **Frontend** — deployed on [Vercel](https://vercel.com), root directory `frontend`, Vite build, configured to call the Render backend URL instead of `localhost:5000`.
- **Database** — Neon PostgreSQL (cloud-hosted, same instance used in local development).

Both deployments auto-redeploy on every push to the `main` branch of this repository.
