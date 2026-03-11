# Employee Management System — Backend

A REST API built with Node.js, Express.js, MongoDB, and Mongoose. Everything lives in a single `index.js` file.

---

## What This Project Does

It lets you manage employee records stored in a cloud MongoDB database. You can create, read, update, delete, and search employees through HTTP API calls.

---

## Project Structure

```
backend/
├── index.js       ← the entire backend (server + database + routes)
├── .env           ← secret config (port, database URL)
├── .gitignore     ← tells git to ignore node_modules and .env
└── package.json   ← project info and dependencies
```

---

## Tech Stack — What and Why

| Technology | What it is | Why we use it |
|---|---|---|
| **Node.js** | JavaScript runtime that runs outside the browser | Lets us write server-side code in JavaScript |
| **Express.js** | Web framework for Node.js | Makes it easy to define routes (URLs) and handle HTTP requests |
| **MongoDB** | NoSQL cloud database | Stores employee data as JSON-like documents (no rigid table structure needed) |
| **Mongoose** | ODM library to talk to MongoDB from Node | Lets us define a schema (data structure) and interact with the database using JavaScript objects |
| **dotenv** | Loads environment variables from a `.env` file | Keeps sensitive data (DB password, port) out of the code |
| **nodemon** | Development tool | Auto-restarts the server when you save code changes |

---

## How to Run

```bash
npm start       # production — runs with node
npm run dev     # development — runs with nodemon (auto-restart on save)
```

The server starts on **port 5000**.

---

## Environment Variables (.env)

```
PORT=5000
MONGO_URI=mongodb+srv://...
```

- `PORT` — which port the server listens on
- `MONGO_URI` — the MongoDB Atlas connection string (includes username, password, cluster URL)

---

## The Employee Schema

This is the structure of each employee document stored in MongoDB.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB auto-generates this unique ID |
| `fullName` | String | Yes | Employee's full name |
| `email` | String | Yes | Must be unique across all employees |
| `phoneNumber` | String | Yes | |
| `department` | String | Yes | e.g. Engineering, HR |
| `designation` | String | Yes | e.g. Software Engineer |
| `salary` | Number | Yes | Must be >= 0 |
| `dateOfJoining` | Date | Yes | |
| `employmentType` | String | No | Only: `Full-time`, `Part-time`, `Contract` |
| `status` | String | No | Defaults to `Active` |

---

## API Endpoints

Base URL: `http://localhost:5000`

### Create an Employee
```
POST /employees
Content-Type: application/json

{
  "fullName": "Aditi Singh",
  "email": "aditi@example.com",
  "phoneNumber": "9876543210",
  "department": "Engineering",
  "designation": "Software Engineer",
  "salary": 60000,
  "dateOfJoining": "2024-01-15",
  "employmentType": "Full-time"
}
```
Returns: `201 Created` — the saved employee object with its `_id`

---

### Get All Employees
```
GET /employees
```
Returns: `200 OK` — array of all employees

---

### Get One Employee by ID
```
GET /employees/:id
```
Example: `GET /employees/64f1a2b3c4d5e6f7a8b9c0d1`

Returns: `200 OK` — single employee object, or `404` if not found

---

### Update an Employee
```
PUT /employees/:id
Content-Type: application/json

{
  "salary": 75000,
  "designation": "Senior Software Engineer"
}
```
Returns: `200 OK` — the updated employee object

---

### Delete an Employee
```
DELETE /employees/:id
```
Returns: `200 OK` — `{ "message": "Employee deleted successfully" }`

---

### Search by Name
```
GET /employees/search?name=aditi
```
Returns: `200 OK` — array of employees whose `fullName` contains "aditi" (case-insensitive)

---

## HTTP Status Codes Used

| Code | Meaning | When it's returned |
|---|---|---|
| 201 | Created | New employee saved successfully |
| 200 | OK | Successful GET, PUT, DELETE |
| 400 | Bad Request | Validation failed (missing required field, wrong type, etc.) |
| 404 | Not Found | Employee with that ID doesn't exist |
| 500 | Internal Server Error | Something broke on the server side |

---

## How the Code Works (index.js walkthrough)

### 1. Setup
```js
require('dotenv').config();
```
This loads `.env` into `process.env` so we can use `process.env.PORT` and `process.env.MONGO_URI` anywhere in the file.

### 2. Express App
```js
const app = express();
app.use(express.json());
```
Creates the server. `express.json()` tells Express to automatically parse incoming JSON request bodies — otherwise `req.body` would be undefined.

### 3. MongoDB Connection
```js
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));
```
Connects to the cloud database. `.then()` runs if it succeeds, `.catch()` runs if it fails.

### 4. Schema and Model
```js
const employeeSchema = new mongoose.Schema({ ... });
const Employee = mongoose.model('Employee', employeeSchema);
```
`employeeSchema` defines field names, types, validations (required, unique, min, enum).
`Employee` is the model — it's how we talk to the `employees` collection in MongoDB. Think of it like a class.

### 5. Routes (API Endpoints)
Each route follows this pattern:
```js
app.METHOD('/path', async (req, res) => {
  try {
    // do database operation
    res.status(CODE).json(result);
  } catch (err) {
    res.status(ERROR_CODE).json({ message: err.message });
  }
});
```
- `req` = the incoming request (contains `req.body`, `req.params`, `req.query`)
- `res` = the outgoing response
- `async/await` = handles asynchronous database operations cleanly
- `try/catch` = if anything goes wrong, send an error response instead of crashing

### 6. Important Route Ordering
`GET /employees/search` is defined **before** `GET /employees/:id`. This matters because if search came second, Express would try to match the word "search" as an `:id` value, which would fail.

### 7. Mongoose Methods Used

| Method | What it does |
|---|---|
| `new Employee(req.body)` + `.save()` | Creates and saves a new document |
| `Employee.find()` | Returns all documents |
| `Employee.findById(id)` | Returns one document by its `_id` |
| `Employee.findByIdAndUpdate(id, data, opts)` | Updates and returns the updated doc (`new: true`) |
| `Employee.findByIdAndDelete(id)` | Deletes and returns the deleted doc |
| `Employee.find({ fullName: { $regex: name, $options: 'i' } })` | Regex search, `i` = case-insensitive |

### 8. Global Error Handler
```js
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});
```
Catches any unhandled errors that get passed via `next(err)`.

---

## Likely Viva Questions

**Q: What is REST API?**
A: REST (Representational State Transfer) is a standard way for apps to communicate over HTTP. Each URL represents a resource (like `/employees`) and HTTP methods (GET, POST, PUT, DELETE) define what to do with it.

**Q: What is Mongoose?**
A: It's an ODM (Object Data Modeling) library that lets you define schemas and models to interact with MongoDB using JavaScript-friendly syntax.

**Q: What is middleware in Express?**
A: A middleware is a function that runs between the request arriving and the response going out. `express.json()` is middleware that parses JSON bodies. Error handlers are also middleware.

**Q: What is `async/await`?**
A: Database operations take time (they're asynchronous). `async` marks a function as asynchronous, and `await` pauses inside that function until the operation completes, without blocking the whole server.

**Q: What does `{ new: true }` do in `findByIdAndUpdate`?**
A: By default, Mongoose returns the old document before update. `{ new: true }` makes it return the updated document instead.

**Q: What is the difference between 400 and 500?**
A: 400 is the client's fault (bad data sent). 500 is the server's fault (something crashed internally).

**Q: Why is `GET /employees/search` defined before `GET /employees/:id`?**
A: Express matches routes in order. If `:id` came first, the word "search" would be captured as an ID value and fail. Defining specific paths before parameterized ones prevents this conflict.

**Q: What is dotenv?**
A: A package that reads key=value pairs from a `.env` file and loads them into `process.env`. This keeps passwords and config out of your source code.

**Q: What is `$regex` in MongoDB?**
A: A MongoDB query operator that matches documents where a field's value matches a regular expression pattern. `$options: 'i'` makes it case-insensitive.

**Q: What is the default value of `status` in the schema?**
A: `'Active'` — Mongoose automatically sets this if no value is provided during creation.
