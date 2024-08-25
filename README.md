# Event Management System

This is an Event Management System that allows users to register and log in securely. Each user can register for one event only once. The system features dynamic loading of events from the database.<br>

## Technologies and Tools

- **Backend:**
  - **Node.js**: JavaScript runtime for server-side programming.
  - **Express**: Web application framework for Node.js.
  - **MongoDB**: NoSQL database for storing user accounts and events.
  - **Mongoose**: ODM library for MongoDB.
  - **Cors**: Middleware for enabling Cross-Origin Resource Sharing.
  - **Helmet**: Security middleware for setting HTTP headers.
  - **Rate Limit**: Middleware for rate limiting requests.
  - **Body-Parser**: Middleware for parsing incoming request bodies.
  - **Bcrypt**: Library for hashing passwords.
  - **dotenv**: Module for loading environment variables from a `.env` file.
  - **Node Limits**: Module for managing file uploads and request limits.
  - **JWT (jsonwebtoken)**: Library for handling authentication with JSON Web Tokens.
  - **Nodemailer** is a library for sending emails in Node.js applications.

- **Frontend:**
  - **React**: JavaScript library for building user interfaces.
  - **Tailwind CSS**: Utility-first CSS framework for styling components.

- **DevOps:**
  - **Docker**: Containerization platform for creating and managing containers.
  - **Kubernetes**: Container orchestration platform for automating deployment, scaling, and operations.
  - **Nginx**: Web server and reverse proxy for handling requests and providing additional security.

- **Test:**
  - **Jest**: A testing framework used for writing and executing tests.
  - **@testing-library/react**: A library for testing React components, which allows rendering components.
  - **@testing-library/jest-dom**: An extension for Jest that adds useful matchers for testing DOM elements.
  - **supertest**: A library that allows making HTTP requests in tests and verifying responses.


## Start the application

**Start Backend :**
```
nodemon server.js
node server.js
```
**Start Frontend:**
```
npm start
```
**Start All:**
```
npm run all-docker
npm run all-k8s
npm run all-nodemon
npm run all-node
```
**Docker/Kubernetes**
```
npm run docker
npm run k8s
```
**Tests**
```
all-test
```


## Tests
| Workflow    | Status                                                                                                                                  |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Tests       | ![Tests](https://github.com/KovacevicAleksa/BookingEvents/actions/workflows/run-tests.yml/badge.svg)                                     |
| Deployment  | ![Deployment](https://github.com/KovacevicAleksa/BookingEvents/actions/workflows/deploy.yml/badge.svg)                                   |



## Folder structure

```
└── 📁backend
    └── 📁__mocks__
        └── fileMock.js
    └── 📁kubernetes
        └── deployment.yaml
        └── secret.yaml
        └── service.yaml
    └── 📁middleware
        └── auth.js
    └── 📁models
        └── account.js
        └── event.js
    └── 📁routes
        └── accountRoutes.js
        └── adminRoutes.js
        └── authRoutes.js
        └── eventRoutes.js
    └── 📁services
        └── emailService.js
    └── 📁tests
        └── event.test.js
    └── .dockerignore
    └── .env
    └── .gitignore
    └── .prettierignore
    └── autocannonApiTest.md
    └── default.conf
    └── docker-compose.yml
    └── Dockerfile
    └── Dockerfile.nginx
    └── eslint.config.mjs
    └── nginx.conf
    └── package-lock.json
    └── package.json
    └── server.js
    └── ZAPToFix.md
```

```
└── 📁frontend
    └── 📁__mocks__
        └── styleMock.js
    └── 📁public
        └── index.html
        └── manifest.json
        └── robots.txt
    └── 📁src
        └── 📁Components
            └── 📁assets
                └── Konferencija.jpg
            └── Card.js
            └── Header.js
            └── PrivateRoute.js
        └── 📁context
            └── AuthContext.js
        └── 📁routes
            └── AdminAddEvent.js
            └── ChangePassword.js
            └── ForgotPassword.js
            └── Login.js
            └── Registration.js
            └── Unauthorized.js
        └── App.js
        └── index.css
        └── index.js
    └── 📁tests
        └── Card.test.js
    └── .babelrc
    └── .gitignore
    └── package-lock.json
    └── package.json
    └── README.md
    └── tailwind.config.js
```

```
└── 📁.github
    └── 📁workflows
        └── deploy.yml
        └── run-tests.yml
```

<br>


![Screenshot 2024-08-25 223617](https://github.com/user-attachments/assets/662b8167-b060-460a-9efd-6fa7d0f8c23a)

![Screenshot 2024-08-25 223612](https://github.com/user-attachments/assets/c3f23d55-30d9-4aae-874b-9ca7875c0741)

![Screenshot 2024-08-25 223604](https://github.com/user-attachments/assets/4371732d-78cb-42d5-b19d-2469cb2dbb68)

![Screenshot 2024-08-05 193507](https://github.com/user-attachments/assets/82cc4bef-1c9f-408b-807e-e6a3ed9607a3)

![Screenshot 2024-08-22 141704](https://github.com/user-attachments/assets/2e90b4bb-62ed-4d79-a7e7-b270ab1483b8)
