# Credora API Reference

Base URL for local development: `http://localhost:5000/api`

Except for health, register, and login, every route requires a JWT bearer token:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Responses are JSON. Errors use a meaningful HTTP status and a JSON `message` where possible.

## Health and authentication

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | API and process health check |
| POST | `/auth/register` | No | Create a user and return a JWT |
| POST | `/auth/login` | No | Verify credentials and return a JWT |

**Register request**

```json
{
  "name": "Demo Evaluator",
  "email": "evaluator@example.com",
  "password": "CredoraDemo123"
}
```

**Login request**

```json
{
  "email": "evaluator@example.com",
  "password": "CredoraDemo123"
}
```

Both successful auth responses contain `token` and a safe `user` object. The password hash is not returned.

## Dashboard

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/dashboard/summary` | KPI metrics, six-month payment totals, loan-status counts, and recent payments |

## Customers

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/customers` | List active customers; optional `?search=term` |
| POST | `/customers` | Create a customer |
| PUT | `/customers/:id` | Update a customer's name, email, and phone |
| DELETE | `/customers/:id` | Soft-delete/archive a customer |

**Create / update request**

```json
{
  "fullName": "Riya Desai",
  "email": "riya@example.com",
  "phone": "+91 98765 43210"
}
```

The email must be valid and unique. Names and phone numbers are required. Archive removes a customer from the active directory without destroying linked historical records.

## Loans

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/loans` | List loans with populated customer details; optional `?status=APPROVED` |
| POST | `/loans` | Create a loan against an active customer |
| PATCH | `/loans/:id/status` | Change loan status to `APPROVED`, `CLOSED`, or `DEFAULTED` |

**Create request**

```json
{
  "customerId": "<customer ObjectId>",
  "principalAmount": 250000,
  "interestRate": 10.5,
  "tenureMonths": 36,
  "startDate": "2026-01-15"
}
```

New loans start as `APPROVED`, with the remaining balance equal to the principal. A loan with a positive balance cannot be marked closed.

## Payments

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/payments` | Read the 100 most recent payment records with loan/customer details |
| POST | `/payments` | Record repayment, reduce balance, and close a fully paid loan |

**Create request**

```json
{
  "loanId": "<loan ObjectId>",
  "amountPaid": 10000
}
```

The server requires a positive amount, an approved loan, and sufficient outstanding balance. It atomically applies a conditional balance decrement before creating the payment ledger entry. If ledger insertion fails, the balance is restored. A fully repaid loan is marked `CLOSED`.

## Delinquency / risk monitor

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/delinquency?status=OPEN` | List risk records; status can be `OPEN` or `RESOLVED` |
| POST | `/delinquency/audit` | Re-check approved loans started more than 30 days ago with a remaining balance |
| PATCH | `/delinquency/:id/resolve` | Mark a risk record as resolved |

The classroom audit calculates `daysOverdue = max(days since loan start − 30, 0)`. Risk classification is LOW for 1–60 days, MEDIUM for 61–90 days, and HIGH for more than 90 days. This is a demonstration rule and must not be interpreted as a production credit policy.

## Status codes to demonstrate

- `200 OK`: successful read or update
- `201 Created`: successful customer / loan / payment / registration creation
- `400 Bad Request`: missing, invalid, or inconsistent input
- `401 Unauthorized`: token missing, invalid, or expired; or invalid sign-in credentials
- `404 Not Found`: referenced record does not exist
- `409 Conflict`: duplicate unique field, such as a registered email
- `500 Internal Server Error`: unexpected server-side failure

## Suggested Postman run order

1. `Health check`
2. `Register` or `Login` (the collection stores the returned JWT in the `token` variable)
3. `List customers` or `Create customer`
4. `Create loan` after setting `customerId`
5. `Record payment` after setting `loanId`
6. `Get dashboard summary`
7. `Run delinquency audit`, then list records and resolve a record if desired

The protected screens in the frontend use the same API endpoints.
