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

- **Frontend:**
  - **React**: JavaScript library for building user interfaces.
  - **Tailwind CSS**: Utility-first CSS framework for styling components.
- **DevOps:**
  - **Docker**: Containerization platform for creating and managing containers.
  - **Kubernetes**: Container orchestration platform for automating deployment, scaling, and operations.
  - **Nginx**: Web server and reverse proxy for handling requests and providing additional security.

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
## Folder structure

```
└── 📁backend
    └── 📁kubernetes
        └── deployment.yaml
        └── secret.yaml
        └── service.yaml
    └── 📁models
        └── account.js
        └── event.js
    └── .dockerignore
    └── .env
    └── .gitignore
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
        └── 📁routes
            └── Login.js
            └── Registration.js
        └── App.js
        └── index.css
        └── index.js
    └── .gitignore
    └── package-lock.json
    └── package.json
    └── README.md
    └── tailwind.config.js
```

<br>

![Screenshot 2024-08-05 193451](https://github.com/user-attachments/assets/4cc2faba-bf29-4f8a-8874-e4301c469e0c)

![Screenshot 2024-08-05 193507](https://github.com/user-attachments/assets/82cc4bef-1c9f-408b-807e-e6a3ed9607a3)
