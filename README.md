# Node.js Notes App & User Authentication Service

This project is a multi-service application built with Node.js and Express, demonstrating a microservices-like architecture for a robust Notes application with separate user authentication.

## 🚀 Key Features

- **Microservices Architecture**: Separate services for the Notes Application and User Authentication.
- **Authentication**: Secure user login using **Passport.js** strategies.
- **Database Agnostic**: Designed to support multiple database backends including **MongoDB**, **SQLite**, **LevelDB**, and an in-memory store.
- **Modern JavaScript**: Built entirely using **ES6 Modules** (`.mjs`).
- **Responsive UI**: Styled with **Tailwind CSS** and **Handlebars (hbs)** templates.

## 🛠️ Tools & Technologies Used

### Backend

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/) (v5 and v4)
- **Authentication**: [Passport.js](https://www.passportjs.org/) (Local Strategy)
- **Session Management**: `express-session`, `session-file-store`
- **Utilities**: `debug`, `fs-extra`, `js-yaml`, `superagent` (for service-to-service communication)

### Frontend

- **Templating Engine**: [Handlebars (hbs)](https://handlebarsjs.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Feather Icons](https://feathericons.com/)

### Databases

- **MongoDB**: Using the native Node.js driver.
- **SQLite**: Managed via **Sequelize** ORM.
- **LevelDB**: For key-value storage experiments.

### DevOps & Tools

- **Environment Variables**: `dotenv` for configuration management.
- **Deployment**: Ready for deployment with `cross-env` scripts.

## 📝 Implementation Details

### Architecture

The project is split into two main components:

1.  **Notes App (`notes-app/`)**: The main user interface and logic for managing notes. It communicates with the User Service for authentication.
2.  **Users Service (`users/`)**: A dedicated microservice handling user registration, password validation, and profile management.

### Key Implementation Patterns

- **ES6 Modules**: The entire codebase uses native ES modules (`import`/`export`) instead of CommonJS (`require`), including a workaround for `__dirname`.
- **Model-View-Controller (MVC)**: Clear separation of concerns with dedicated `routes/`, `views/`, and `models/` directories.
- **Flexible Data Layer**: The `NOTES_MODEL` environment variable allows hot-swapping the database backend (e.g., switching from Memory to MongoDB without changing application logic).
- **Security**: Sensitive configuration (DB URLs, Secrets) is managed via a root `.env` file (not committed to version control).

## ⚙️ Setup & Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    ```

2.  **Install Dependencies**:
    Dependencies must be installed for both services.

    ```bash
    cd notes-app && npm install
    cd ../users && npm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` to `.env` and configure your keys (MongoDB URL, etc.).

    ```bash
    cp .env.example .env
    ```

4.  **Run the Services**:
    You can run the services independently.

    _Start the User Service:_

    ```bash
    cd users
    npm start
    ```

    _Start the Notes App (in a separate terminal):_

    ```bash
    cd notes-app
    npm run start-mongodb  # or start-sqlite3, start-fs
    ```

5.  **Access the App**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
├── .env                  # Environment variables
├── notes-app/            # Main Notes Application
│   ├── bin/              # Server entry point
│   ├── models/           # Database adapters (Mongo, SQLite, etc.)
│   ├── public/           # Static assets (CSS, JS)
│   ├── routes/           # Express routes
│   └── views/            # Handlebars templates
└── users/                # User Authentication Microservice
    ├── user-server.mjs   # Service entry point
    └── users-*.mjs       # User models and logic
```
