# Fundsroom Mini ERP + CRM

A basic ERP + CRM portal built for the Fundsroom Full Stack Developer take-home assignment. Includes JWT-based authentication with 4 roles, a Customer CRM module, a Product & Inventory module, and a Sales Challan module with real stock-deduction logic.

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

Four tables: `users`, `customers`, `products`, `challans`.

- **users** — id, name, email, password (hashed), role (Admin / Sales / Warehouse / Accounts)
- **customers** — id, name, mobile, and other CRM fields
- **products** — id, name, sku, category, unit_price, current_stock, min_stock_alert, location
- **challans** — id, challan_number, customer_id, products (JSON array of `{product_id, quantity, price}`), total_quantity, status, created_by, created_at

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

**Challans**
- `POST /challans` — create a challan. Validates stock availability for every line item inside a database transaction; if any product has insufficient stock, the entire request is rejected and rolled back (no partial updates, no negative stock). On success, `current_stock` is deducted for each product.
- `GET /challans` — list (paginated)
- `GET /challans/:id` — get one

A Postman collection is included alongside this README for testing all endpoints directly.

---

## Assumptions Made

- All 4 roles can currently access all modules — the API does not yet enforce per-role permissions on top of authentication (see Known Limitations).
- Challans are created directly with a `products` array of `{product_id, quantity}` supplied by the frontend; product price/name are looked up server-side at creation time rather than being trusted from the client where relevant.
- A challan's `status` defaults to `Draft` since a full Draft → Confirm workflow was out of scope for this submission.
- Given the assignment's time constraint, **Option B** was chosen: build all 4 modules to a working, tested, basic-CRUD standard rather than building one module in full depth. This was a deliberate scope decision, not an oversight.

---

## Known Limitations

This submission was built under a tight time constraint. In the interest of transparency:

- **Role-based access control is not fully implemented.** All 4 roles can log in and reach all modules; the backend does not yet restrict actions by role (e.g., a Sales user could technically perform an action intended for Admin only). Given more time, this would be handled with role-checking middleware on each route.
- **Draft → Confirm workflow for challans is simplified.** Challans are created directly; there is no separate "confirm" step that would, for example, lock the challan from further edits.
- **No automated tests** (unit or integration) are included.
- **Frontend UI is functional but visually basic** — the priority was working, correct business logic over visual polish, given the time available.
- **Product snapshotting in challans is partial.** Product name/price are captured at challan-creation time, but there is no versioning if a product is later renamed or repriced.

What **is** fully implemented and tested despite the time constraint: JWT auth, all 4 modules' CRUD operations, protected frontend routes, and — most importantly — real stock-deduction logic with negative-stock prevention, wrapped in a database transaction so a failed challan never partially updates stock.

---

## Deployment

This submission is provided as a **local setup + screen recording** (an explicitly allowed alternative per the assignment instructions), rather than a hosted deployment, due to time constraints. The recording demonstrates the full flow: login, all 4 modules, stock deduction on challan creation, the insufficient-stock rejection case, and protected routes.

To deploy in future: backend to Render/Railway (set the same env vars as above), frontend to Vercel/Netlify (set `VITE_API_URL` pointing to the deployed backend, and update `frontend/src/services/api.ts` to use it instead of `localhost:5000`).
