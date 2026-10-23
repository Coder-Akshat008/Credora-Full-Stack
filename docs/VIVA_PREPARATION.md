# Credora — Mini Project Evaluation / Viva Notes

Use these as concise talking points. Be able to explain the specific code and run the demonstration yourself.

## 60-second project introduction

“Credora is a responsive full-stack lending operations dashboard. The frontend uses React, JavaScript, and CSS. It communicates with REST APIs implemented using Node.js and Express. MongoDB stores users, customers, loans, payment entries, and delinquency records. The main workflows are customer management, loan creation, repayment processing, portfolio overview, and overdue-risk follow-up. I included password hashing, JWT-protected routes, server-side validation, a Postman collection, seed data, and Render deployment instructions. It demonstrates frontend, backend, database, API testing, and deployment concepts without relying on Java.”

## Important questions and answers

### 1. What is full-stack development?
It is the development of both the client-side interface and server-side logic, including how the application stores and retrieves data. Credora uses React on the frontend, Express/Node.js on the backend, and MongoDB as the database.

### 2. Why did you choose Credora?
The original project already had a useful domain—customers, loans, repayments, dashboard metrics, and delinquency records. Rebuilding it as a web application makes it directly suitable for the course’s React, REST API, MongoDB, and deployment outcomes.

### 3. What is React?
React is a JavaScript library for building component-based user interfaces. Credora uses reusable components and state/effect hooks to render data and respond to user interactions.

### 4. What is a component?
A component is a reusable UI unit. Examples in this project include `PageHeader`, `Modal`, `StatusPill`, and feature screens such as `Customers` and `Loans`.

### 5. What are `useState` and `useEffect` used for here?
`useState` holds values such as current form data, selected page, API responses, and loading state. `useEffect` runs data-fetching logic when a page is mounted or a filter changes.

### 6. What is Node.js?
Node.js is a JavaScript runtime that runs JavaScript outside a browser. It runs the Credora server process.

### 7. What is Express?
Express is a Node.js web framework used to register routes and middleware. Credora groups routes by feature, such as `/api/customers` and `/api/loans`.

### 8. What is a REST API?
A REST-style API exposes resources through URLs and uses HTTP methods. In Credora, GET reads records, POST creates records or runs the audit, PUT updates a customer, and PATCH makes a partial change such as loan status or risk resolution.

### 9. What is JSON?
JSON is a text data-interchange format. The React frontend sends JSON request bodies and parses JSON responses from Express.

### 10. Why MongoDB?
MongoDB is a document-oriented NoSQL database. Its documents represent customers, loans, payments, and risks. Mongoose defines schemas, validation, and references between documents.

### 11. What is CRUD?
CRUD means Create, Read, Update, and Delete. Customer creation/listing/updating/archiving demonstrates CRUD. The customer “delete” route archives the record rather than permanently erasing it.

### 12. What is Mongoose?
Mongoose is an object data modelling (ODM) library for MongoDB and Node.js. Credora uses it for model definitions, validation, queries, population, and database access.

### 13. How are collections related?
A loan stores a customer ObjectId. A payment stores a loan ObjectId. A delinquency record also stores a loan ObjectId. `populate()` retrieves selected linked fields for display.

### 14. How does login work?
Registration validates fields and hashes the password with bcrypt. Login retrieves the stored hash and compares it with the submitted password. If valid, the server signs a JWT and returns it to the client.

### 15. What is JWT?
A JSON Web Token is a signed token that can carry claims such as the authenticated user ID. The client sends it in an `Authorization: Bearer` header, and middleware verifies it before protected API handlers run.

### 16. Why hash passwords?
A password hash avoids storing the original plaintext password. bcrypt applies a computationally expensive password-hashing function, making stolen hashes harder to crack than plaintext credentials.

### 17. What does middleware do?
Middleware runs between the incoming request and the route handler. Credora uses authentication middleware to validate the token and security middleware for headers, CORS, request logging, rate limiting, and JSON parsing.

### 18. How is input validation handled?
Forms include required fields and appropriate input types, while the server independently checks values and business rules. Server-side validation is necessary because clients can be bypassed.

### 19. How does repayment update the loan?
The server verifies that the loan is approved and that its current remaining balance is at least the payment. It then performs a conditional atomic decrement, records the payment, and closes the loan if the balance reaches zero. Overpayments are rejected.

### 20. What is an atomic update?
It is an operation applied as a single database update, avoiding an exposed read-then-write gap for that balance decrement. The filter includes the minimum required balance, so concurrent requests cannot both decrement a balance that no longer meets the condition.

### 21. What is a delinquency audit?
It is a demonstrative rule that checks approved loans older than 30 days with an outstanding balance. It calculates overdue days and sets LOW, MEDIUM, or HIGH. Explain clearly that this is an academic rule, not a validated credit-risk score.

### 22. What is Postman used for?
Postman sends HTTP requests to test endpoints without depending on the user interface. It can verify status codes, request validation, authentication, and the JSON data returned by each route.

### 23. What is CORS?
Cross-Origin Resource Sharing is a browser security mechanism that controls which origins can make frontend requests to the API. Credora reads permitted client origins from the `CLIENT_URL` environment variable.

### 24. What is an environment variable?
It is configuration supplied outside the source code. Credora uses variables for the MongoDB connection URI, JWT secret, port, runtime mode, allowed frontend origin, and frontend API URL.

### 25. What is deployment?
Deployment makes an application accessible in a hosting environment. The README explains deploying the Express API as a Render web service, the built Vite frontend as a Render Static Site, and using MongoDB Atlas for cloud storage.

### 26. What are HTTP status codes used in the project?
`200` for successful reads/updates, `201` for successful creation, `400` for invalid input, `401` for unauthorised access, `404` for missing records, and `409` for duplicate unique values.

### 27. What is the difference between SQL and NoSQL?
Relational SQL databases store data in structured tables and use relations/joins. MongoDB stores JSON-like documents in collections. Credora’s course-aligned implementation uses MongoDB; the uploaded SQL schema belongs to the original MySQL version.

### 28. Why is a customer archived instead of permanently deleted?
A loan may still reference that customer. Archiving removes the person from the active directory while keeping existing historical references intact.

### 29. What would you improve next?
Add automated unit/integration tests, stronger role management, a complete audit log, pagination, a formal loan amortisation schedule, accessibility checks, and a reviewed risk policy. A production financial system would require formal security and compliance review.

### 30. Is this production-ready?
No. It is an educational demonstration. It uses synthetic data and a simple risk rule. Real financial use would require more rigorous transaction handling, privacy safeguards, monitoring, operational controls, testing, and domain review.

## Evaluation demo checklist

- [ ] Start MongoDB and the API; show `GET /api/health`.
- [ ] Run `npm run seed` and confirm demo records appear.
- [ ] Register and sign in.
- [ ] Add a synthetic customer; show it in the directory.
- [ ] Create a loan for the customer.
- [ ] Record one valid repayment and show the remaining balance update.
- [ ] Attempt an overpayment and explain the backend validation.
- [ ] Run the delinquency audit and resolve a risk item.
- [ ] Show Postman requests and explain token-protected routes.
- [ ] Explain environment variables and the frontend/backend deployment path.

**Be honest in evaluation:** demonstrate the code that actually exists, explain the intentional limitations, and do not claim a live deployment or automated tests unless you have run them.
