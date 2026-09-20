# B2B RFQ Marketplace

A mini Request-for-Quotation marketplace where **Buyers** post requirements and
**Suppliers** discover them and submit quotations.

- **Backend:** Python, Django, Django REST Framework, MySQL (SQLite fallback for local dev), JWT auth
- **Frontend:** React (Vite), React Router, Axios

---

## 1. Tech Stack

| Layer          | Technology                                             |
|----------------|---------------------------------------------------------|
| Frontend       | React 18, Vite, React Router 6, Axios                   |
| Backend        | Django 5.2 (LTS), Django REST Framework, SimpleJWT      |
| Database       | MySQL (production) / SQLite (quick local dev, default)  |
| Auth           | JWT (access + refresh tokens)                           |
| Filtering      | django-filter, DRF SearchFilter/OrderingFilter           |

> **Python version:** requires Python 3.10–3.13 (Django 5.2 does not yet
> support very new Python releases like 3.14+ at every point release — if
> your machine has a newer Python installed, create the virtualenv with an
> explicit older interpreter, e.g. `py -3.12 -m venv venv` on Windows or
> `python3.12 -m venv venv` on Mac/Linux).

---

## 2. Architecture Overview

```
rfq-marketplace/
├── backend/                # Django project (REST API only, no server-rendered pages)
│   ├── config/              # settings, urls, custom DRF exception handler
│   ├── accounts/            # custom User model (role: BUYER/SUPPLIER), register/login/me
│   ├── rfqs/                 # RFQ model + CRUD API, role-based permissions
│   └── quotations/          # Quotation model + submit/list API
└── frontend/                # React SPA (Vite)
    └── src/
        ├── api/axios.js       # axios instance + JWT auto-refresh interceptor
        ├── context/           # AuthContext (login/register/logout, session restore)
        ├── components/        # Navbar, PrivateRoute, RFQForm, loading/empty/error states
        └── pages/              # Login, Register, Buyer pages, Supplier pages
```

**Design decisions:**

- **Two-app separation on the backend** (`rfqs`, `quotations`) keeps each model's
  API, serializer, and permission logic together and easy to reason about.
- **Role is a field on the User model**, not separate tables, since a user is
  either a Buyer or a Supplier and never both — this keeps auth simple
  (one login endpoint, one token) while every endpoint still enforces the
  correct role server-side (never trusting the frontend alone).
- **Object-level permissions** (`IsOwnerBuyer`, `IsQuotationOwnerOrRFQBuyer`)
  ensure a buyer can only edit their own RFQs, and only the owning buyer can
  see quotations submitted against their RFQ — a supplier cannot see another
  supplier's quote.
- **One quotation per supplier per RFQ** is enforced with a DB-level unique
  constraint plus a serializer-level check, preventing duplicate spam quotes.
- **JWT with silent refresh**: the frontend axios interceptor automatically
  refreshes an expired access token using the refresh token, retrying the
  original request — so the user isn't logged out mid-session unnecessarily.
- **Consistent error shape** (`{"detail": ..., "errors": {...}}`) from a custom
  DRF exception handler means the frontend can show one generic error banner
  or field-level errors without special-casing every endpoint.
- **SQLite by default, MySQL via one env var** — this made local development
  and automated testing of every flow trivial (no DB server needed) while
  still meeting the "use MySQL" requirement for deployment. Switching is a
  single `.env` change (`DB_ENGINE=mysql`), no code changes.

---

## 3. Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+ (only if you want to run against MySQL instead of the SQLite default)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env if you want MySQL instead of the SQLite default:
#   DB_ENGINE=mysql
#   DB_NAME=rfq_marketplace
#   DB_USER=root
#   DB_PASSWORD=yourpassword
#   DB_HOST=127.0.0.1
#   DB_PORT=3306
# (If using MySQL, create the database first: `CREATE DATABASE rfq_marketplace;`)

python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000/`. Health check: `GET /`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit VITE_API_BASE_URL if your backend isn't at http://127.0.0.1:8000/api
npm run dev
```

The app runs at `http://localhost:5173/`.

### Try it out
1. Go to `/register`, create a **Buyer** account and a **Supplier** account (in two browser
   tabs, or logout/login between them).
2. As the Buyer: create an RFQ (product, description, quantity, delivery location, deadline).
3. As the Supplier: go to "Browse RFQs", open the RFQ, submit a quotation.
4. As the Buyer: open "My RFQs" → the RFQ → see the quotation under "Quotations Received".
5. As the Supplier: check "My Quotations" to see everything you've submitted.

---

## 4. API Summary

All endpoints (except register/login/refresh) require `Authorization: Bearer <access_token>`.

| Method | Endpoint                         | Who         | Description                              |
|--------|-----------------------------------|-------------|-------------------------------------------|
| POST   | `/api/auth/register/`             | Public      | Create account (role: BUYER or SUPPLIER)  |
| POST   | `/api/auth/login/`                | Public      | Get access + refresh tokens               |
| POST   | `/api/auth/token/refresh/`        | Public      | Refresh access token                      |
| GET    | `/api/auth/me/`                   | Authenticated | Current user profile                    |
| GET/POST | `/api/rfqs/`                    | Auth / Buyer(POST) | Browse open RFQs / create RFQ      |
| GET    | `/api/rfqs/mine/`                 | Buyer       | Buyer's own RFQs (all statuses)           |
| GET/PATCH/DELETE | `/api/rfqs/<id>/`        | Auth / Owner Buyer | View / edit / delete an RFQ        |
| GET/POST | `/api/quotations/`               | Supplier    | Supplier's own quotes / submit a new one  |
| GET/PATCH/DELETE | `/api/quotations/<id>/`  | Owner Supplier / RFQ Buyer | Manage a quotation        |
| GET    | `/api/quotations/rfq/<rfq_id>/`   | Owning Buyer | Quotations received on one RFQ           |

Query params on `GET /api/rfqs/`: `search=`, `ordering=`, `status=OPEN|CLOSED`.

---

## 5. Deployment Notes

- **Backend**: any host that runs Django (Railway, Render, PythonAnywhere, an EC2/VM, etc.).
  Set `DEBUG=False`, a real `SECRET_KEY`, `ALLOWED_HOSTS`, a MySQL database
  (`DB_ENGINE=mysql` + credentials), and `CORS_ALLOWED_ORIGINS` to your frontend's
  deployed URL. Run `python manage.py collectstatic` and serve with `gunicorn config.wsgi`.
  Whitenoise is already wired in for serving static/admin assets.
- **Frontend**: any static host (Vercel, Netlify, Render static site). Set
  `VITE_API_BASE_URL` to your deployed backend's `/api` URL at build time.
- **Database**: create a MySQL database and user, put credentials in the
  backend `.env`, then run `python manage.py migrate`.

---

## 6. Assumptions & Limitations

- A user is strictly one role (Buyer or Supplier) for their account's lifetime;
  switching roles isn't supported (would require a new account).
- No email verification or password-reset flow — out of scope for this assignment.
- A supplier can submit only **one** quotation per RFQ; they can edit it via
  `PATCH /api/quotations/<id>/` instead of submitting duplicates.
- RFQ "deadline" is a date, not a timestamp; an RFQ automatically becomes
  ineligible for new quotes once its buyer sets it to `CLOSED` (the buyer
  toggles this manually — there's no cron job auto-closing on the deadline date,
  though `is_expired` is exposed on the API for the frontend/UI to flag it).
- No pagination UI was built for very large result sets beyond DRF's default
  page size (10) — the API paginates, but the demo frontend renders the first
  page. Straightforward to extend with a "load more"/page control.
- File attachments on RFQs/quotations are not supported.
- Currency is displayed as ₹ (INR) as a UI default — the underlying field is
  a plain decimal with no currency code, so this is a display choice only.


  ## Live Links
- **Live App:** https://rfq-marketplace-rose.vercel.app
- **Backend API:** https://rfq-marketplace-production.up.railway.app/api
- **GitHub Repo:** https://github.com/raju8143/rfq-marketplace.git
