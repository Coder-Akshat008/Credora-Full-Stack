# Credora — Lending Operations Dashboard

**Full Stack Development mini project | React · Node.js · Express · MongoDB**

Credora is a web-based loan-servicing and portfolio-monitoring application. It carries forward the strongest ideas from the original Java/MySQL Credora project—customer records, loan accounts, repayments, dashboard metrics, and delinquency monitoring—and implements them as a modern full-stack web application aligned with the course outline.

> **For evaluation:** Java concepts are not required for this mini project. The implementation focuses on HTML, CSS, JavaScript, React, REST APIs, MongoDB CRUD, authentication, API testing, and deployment readiness.

## Highlights

- Responsive financial-operations dashboard with KPI cards, repayment trend, portfolio mix, and recent payment activity.
- Customer directory with search, create, edit, and archive operations.
- Loan lifecycle management: create loans, view principal and outstanding balances, and manage loan status.
- Repayment ledger: validate payments, update balances, automatically close fully repaid loans, and prevent payments above the outstanding balance.
- Delinquency monitor: run a demonstrative overdue audit, classify records into LOW / MEDIUM / HIGH risk, and resolve follow-up records.
- Register / sign in using password hashing and signed JWT sessions.
- Server-side input validation, protected business routes, authentication rate limiting, security headers, CORS allow-list, and structured error responses.
- MongoDB seed data, Postman collection, project report, API reference, and viva preparation.
- Render backend configuration and a deployment checklist.

## Technology mapping to the course outline

| Course outcome / topic | Credora implementation |
| --- | --- |
| CO1 — responsive web interface | Semantic HTML entry point, responsive CSS, forms, validation, mobile layout |
| CO2 — dynamic frontend using React | React components, hooks (`useState`, `useEffect`, `useMemo`), interactive views, charts |
| CO3 — RESTful backend | Express routes, JSON requests/responses, status codes, authentication middleware |
| CO4 — database CRUD and modelling | Mongoose models and CRUD for customers, loans, payments, and delinquency records |
| CO5 — deployment and demonstration | Environment variables, Render backend blueprint, Vite production build and live-deployment checklist |
| API testing | `docs/CREDORA.postman_collection.json` and `docs/API_REFERENCE.md` |

The supplied course outline names Node.js / Express and MongoDB integration as core deliverables, including CRUD, authentication, environment variables, API testing, and a deployed application. This project is deliberately built around those items rather than the former Swing application.

## Project structure

```text
credora-fullstack/
├── client/                       # React + Vite frontend
│   ├── src/
│   │   ├── components/            # Reusable modal, page heading, status pill
│   │   ├── lib/                   # API helper and display formatting
│   │   ├── pages/                 # Authentication and feature screens
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── vite.config.js
├── server/                       # Node.js + Express API
│   ├── src/models/               # Mongoose document models
│   ├── src/routes/                # REST endpoints
│   ├── src/middleware/            # JWT authentication
│   ├── src/server.js
│   ├── src/seed.js
│   └── .env.example
├── docs/
│   ├── API_REFERENCE.md
│   ├── PROJECT_REPORT.md
│   ├── VIVA_PREPARATION.md
│   └── CREDORA.postman_collection.json
└── render.yaml
```

## Requirements

- Node.js 20+ recommended
- npm
- A MongoDB instance: local MongoDB Community Server or MongoDB Atlas
- A browser and Postman for API testing

## Run locally

### 1. Configure the backend

```bash
cd server
```

Copy `server/.env.example` to `server/.env` and update `MONGO_URI` and `JWT_SECRET`. Example local values:

```dotenv
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/credora_db
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
```

Start MongoDB locally, then install and run the API:

```bash
npm install
npm run dev
```

API health check: <http://localhost:5000/api/health>

### 2. Add realistic demo records

Open a second terminal from the project root:

```bash
cd server
npm run seed
```

Seeding runs only when the customer collection is empty; it does not wipe an existing database. It creates synthetic customers, loans, payments, and risk records. The seed script does **not** create an account: use the registration screen to create your own login.

### 3. Run the frontend

In a new terminal:

```bash
cd client
```

Copy `client/.env.example` to `client/.env` and ensure this value is set:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm install
npm run dev
```

Open <http://localhost:5173>, register an account, and explore the dashboard. Keep the API and MongoDB running while using the app.

### Alternative: install both from the project root

```bash
npm run install:all
npm run dev:server
```

In a separate terminal use `npm run dev:client`. The root scripts are convenience shortcuts; the individual `server/` and `client/` commands above are the clearest approach for a live demo.

## Suggested demo flow (5–7 minutes)

1. Register / sign in and show the responsive dashboard.
2. Open **Customers** and add a synthetic customer; update its contact details.
3. Open **Loan portfolio** and create a loan against that customer.
4. Open **Repayments**, record an amount below the current balance, then return to the loan portfolio to show the updated balance.
5. Try to enter an amount greater than the outstanding balance to show validation.
6. Open **Risk monitor**, run the demo audit, explain the risk-level rule, and mark a record resolved.
7. Briefly show the API health route, MongoDB collections, and the Postman collection.

Use fictional records only. Do not enter real financial, identity, or customer data.

## API testing in Postman

Import `docs/CREDORA.postman_collection.json` into Postman. Set the collection variables:

- `baseUrl` → `http://localhost:5000/api`
- `token` → populated automatically by the Login / Register requests when the Postman test script runs
- `customerId`, `loanId`, `delinquencyId` → set to IDs returned by the corresponding create/list endpoints when needed

Run the public health and authentication requests first. Protected requests require `Authorization: Bearer <token>`. Full route descriptions and representative payloads are in `docs/API_REFERENCE.md`.

## Deployment (Render + MongoDB Atlas)

1. Create a MongoDB Atlas cluster and database user. Allow only the network access needed for your deployment; use Atlas connection-string credentials stored in environment variables.
2. Push the project to your Git repository.
3. In Render, create the backend from the included `render.yaml` (Blueprint) or create a Node web service manually with **Root Directory** `server`, **Build Command** `npm install`, **Start Command** `npm start`, and health check `/api/health`.
4. Set backend environment variables: `MONGO_URI` (Atlas URI), a strong `JWT_SECRET`, `NODE_ENV=production`, `JWT_EXPIRES_IN=8h`, and `CLIENT_URL` to the deployed frontend origin. Keep secrets out of Git.
5. Create a Render **Static Site** from the same repository. Set **Root Directory** `client`, **Build Command** `npm install && npm run build`, **Publish Directory** `dist`, and build environment variable `VITE_API_URL` to `https://YOUR-BACKEND-SERVICE.onrender.com/api`.
6. Update backend `CLIENT_URL` to the exact frontend origin (no trailing slash), then redeploy the backend.
7. Test `/api/health`, register/login, and each protected feature using the deployed frontend. Check Render logs if MongoDB or CORS fails.

The frontend and backend services have to be configured with their actual deployment URLs. No fake or pre-filled live URL is claimed by this repository.

## Important scope notes

- The delinquency audit is an **illustrative classroom rule** based on the loan start date, not a real credit-risk model or legal lending policy.
- This is an academic demonstration, not a production financial system. Before real-world use, add stronger account-administration controls, audit trails, formal transaction strategies, monitoring, accessibility testing, and a reviewed compliance/security process.
- The React frontend and Express API are separate services. MongoDB is the data store; the old SQL file is provided as project history, not as the live database for this version.
