# Node.js Notes App & User Authentication Service

This project is a full-stack multi-service application built with **Node.js** and **Express**, featuring a microservices-inspired architecture. It consists of a dedicated Notes Application and a separate User Authentication Service, demonstrating robust separation of concerns, secure authentication, and flexible database integration.

**Live Demo:** [Hosted on Render](https://github.com/Ifeoludev/Full-stack-notes-app)

## Key Features

- **Microservices Architecture**: Logical separation between the core application (`notes-app`) and the authentication provider (`users`), communicating via internal APIs.
- **Robust Authentication**: Secure user authentication implementing **Passport.js** (Local Strategy) with session management.
- **Database Agnostic**: Built with a flexible model layer that can hot-swap between **MongoDB**, **SQLite**, **LevelDB**, or in-memory storage.
- **Modern JavaScript**: Written entirely in **ES6 Modules** (`.mjs`) for a modern, standard-compliant codebase.
- **Modern UI/UX**: Responsive interface styled with **Tailwind CSS** and using **Handlebars** for server-side rendering.

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Auth**: Passport.js, express-session
- **Communication**: Superagent (REST client)
- **Utilities**: fs-extra, debug, dotenv

### Frontend

- **Templates**: Handlebars (hbs)
- **Styling**: Tailwind CSS
- **Icons**: Feather Icons

### Data Persistence

- **MongoDB** (Native Driver)
- **SQLite** (via Sequelize ORM)
- **LevelDB** (Key-Value Store)

## Security & Production

This application is designed with production-grade security practices suitable for modern cloud deployments:

- **Transport Security**: HTTPS/TLS is handled by the cloud provider (Render) at the load balancer level, ensuring encryption in transit without complex manual certificate management.
- **SQL Injection Protection**: Utilizes **Sequelize ORM** for SQL interactions, which systematically parameterizes queries to protect against injection vulnerabilities.
- **Service Isolation**: Critical user credentials are managed in a separate `users` microservice, logically isolating sensitive authentication data from the main application content.
- **Environment Management**: Secrets and database credentials are managed strictly via environment variables (`.env`), ensuring no sensitive keys are ever committed to version control.

## Deployment & Setup

### Hosting on Render

This application is deployed on **Render** as a Web Service. The deployment takes advantage of Render's native support for Node.js, automatic HTTPS termination, and continuous deployment from GitHub.

### Running Locally

1. **Clone & Install**

   ```bash
   git clone https://github.com/Ifeoludev/Full-stack-notes-app.git
   cd notes-app && npm install
   cd ../users && npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory with your credentials:

   ```env
   MONGO_URL=mongodb://localhost:27017/notes
   SESSION_SECRET=your_secret_key
   ```

3. **Start Services**
   Run the services in separate terminals:

   ```bash
   # Terminal 1: User Service
   cd users && npm start

   # Terminal 2: Notes App
   cd notes-app && npm run start-mongodb
   ```

## Project Structure

```text
├── notes-app/            # Main Application Logic
│   ├── models/           # Database Adapters (Mongo, SQLite, Memory)
│   ├── routes/           # Express Route Controllers
│   ├── views/            # Handlebars Templates
│   └── public/           # Static Assets
│
└── users/                # Authentication Service
    ├── user-server.mjs   # Service Entry Point
    └── models/           # User Data Models
```
