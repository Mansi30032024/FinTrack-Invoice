# FinTrack-Invoice 

# Invoice Generator System

A full-stack Invoice Generator System for managing clients, creating invoices, tracking payment status, and viewing invoice revenue from a clean dashboard.

The project uses JWT authentication, protected invoice/client APIs, MongoDB Atlas storage, and a modular React frontend. The code is intentionally simple and readable so the project can be explained clearly in interviews while still showing practical full-stack skills.

## Features

- User signup and login with JWT authentication
- Login/signup screen before dashboard access
- Protected dashboard using token saved in `localStorage`
- Add clients with company, email, phone, and address details
- Create invoices with items, quantity, price, tax, discount, due date, and status
- Automatic subtotal, tax, and final amount calculation in backend model middleware
- Dashboard summary cards for total invoices, paid invoices, pending invoices, and revenue
- Invoice status update: `draft`, `sent`, and `paid`
- Print invoice summary from the invoice table
- Delete invoices from the dashboard
- Modular React component structure for easy maintenance
- REST API backend using Express and MongoDB Atlas

## Tech Stack

**Frontend:** React, Vite, Axios, CSS

**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcrypt

## Project Structure

```text
invoice/
|-- backend/
|   |-- models/
|   |   |-- client.js
|   |   |-- invoice.js
|   |   `-- user.js
|   |-- routes/
|   |   |-- clientRoutes.js
|   |   |-- invoiceRoutes.js
|   |   `-- userRoutes.js
|   |-- .env
|   |-- db.js
|   |-- jwt.js
|   |-- package.json
|   `-- server.js
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- AuthPage.jsx
|   |   |   |-- ClientForm.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- InvoiceForm.jsx
|   |   |   |-- InvoiceTable.jsx
|   |   |   |-- StatsGrid.jsx
|   |   |   `-- Topbar.jsx
|   |   |-- data/
|   |   |   `-- formDefaults.js
|   |   |-- services/
|   |   |   `-- api.js
|   |   |-- App.css
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env
|   |-- package.json
|   `-- vite.config.js
|
|-- docs/
|   `-- invoice-flow.svg
|
`-- README.md
```

## Application Route Design

![Invoice Generator Application Flow](docs/invoice-flow.svg)

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/user/signup` | Create a new user account | Public |
| `POST` | `/user/login` | Login and receive JWT token | Public |

### Clients

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/client` | Add a new client | Authenticated |
| `GET` | `/client` | Get all clients created by logged-in user | Authenticated |
| `GET` | `/client/:clientID` | Get one client by ID | Authenticated |
| `PUT` | `/client/:clientID` | Update client details | Authenticated |
| `DELETE` | `/client/:clientID` | Delete a client | Authenticated |

### Invoices

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/invoice` | Create a new invoice | Authenticated |
| `GET` | `/invoice` | Get all invoices with client details | Authenticated |
| `GET` | `/invoice/summary/count` | Get dashboard invoice counts and revenue | Authenticated |
| `GET` | `/invoice/:invoiceID` | Get one invoice by ID | Authenticated |
| `PUT` | `/invoice/:invoiceID` | Update invoice details | Authenticated |
| `PUT` | `/invoice/status/:invoiceID` | Update invoice status | Authenticated |
| `DELETE` | `/invoice/:invoiceID` | Delete invoice | Authenticated |

## Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5050
MONGODB_URL=mongodb+srv://username:password@cluster-name.mongodb.net/database-name
JWT_SECRET=your_jwt_secret
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:PORT
```

For deployed frontend, use your Render backend URL:

```env
VITE_API_URL=https://your-backend-name.onrender.com
```

## Installation and Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Start backend server

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5050
```

### 3. Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 4. Start frontend

```bash
npm run dev
```

The frontend runs on the Vite development URL, usually:

```text
http://localhost:5173
```

## Frontend Routing Behavior

This project does not use `react-router-dom`. It uses simple React state:

- If token is missing, show `AuthPage`.
- After login/signup, save JWT token and user data in `localStorage`.
- If token exists, show `Dashboard`.
- Logout clears `localStorage` and returns user to login/signup page.

This keeps the routing easy to understand and explain.

## Deployment Notes

### Backend on Render

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables:
  - `MONGODB_URL`
  - `JWT_SECRET`

### Frontend on Vercel

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Add environment variable:
  - `VITE_API_URL=https://your-backend-name.onrender.com`

## Local Checklist

- Backend `.env` has `MONGODB_URL`, `JWT_SECRET`, and `PORT=5050`.
- Frontend `.env` has `VITE_API_URL=http://localhost:5050`.
- Backend is running before using frontend APIs.
- MongoDB Atlas Network Access allows your current IP address.
- Restart backend and frontend after changing any `.env` file.

## Resume Highlights

- Built a full-stack invoice management app with React, Express, MongoDB, and JWT.
- Designed protected REST APIs for clients, invoices, invoice summaries, and status updates.
- Implemented backend invoice total calculation using Mongoose middleware.
- Refactored the frontend into reusable, readable React components.
- Prepared project for deployment using Render, Vercel, and MongoDB Atlas.
