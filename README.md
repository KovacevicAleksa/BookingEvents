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
  - **Socket.IO**: Library for real-time and live chat functionality.

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

| Workflow   | Status                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Tests      | ![Tests](https://github.com/KovacevicAleksa/BookingEvents/actions/workflows/run-tests.yml/badge.svg)   |
| Deployment | ![Deployment](https://github.com/KovacevicAleksa/BookingEvents/actions/workflows/deploy.yml/badge.svg) |

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
		└── resetAccountLimiter.js
	└── 📁models
		└── account.js
		└── event.js
	└── 📁routes
		└── accountRoutes.js
		└── adminRoutes.js
		└── authRoutes.js
		└── chatRoutes.js
		└── eventRoutes.js
		└── healthCheckRoutes.js
	└── 📁services
		└── emailService.js
	└── 📁sql
		└── messages.sql
	└── 📁tests
		└── event.test.js
	└── .babelrc
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
	└── jest.config.js
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
				└── hoverPhoto.gif
				└── Konferencija.jpg
			└── Card.js
			└── Header.js
			└── PrivateRoute.js
		└── 📁context
			└── AuthContext.js
		└── 📁routes
			└── AdminAddEvent.js
			└── ChangePassword.js
			└── Chat.js
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
	└── Dockerfile.frontend
	└── nginx.conf
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

```
└── 📁node_modules
└── .env
└── docker-compose.yml
└── package-lock.json
└── package.json
└── README.md
```

<br>

![Screenshot 2024-09-10 201917](https://github.com/user-attachments/assets/314b13f8-ada2-4b23-bf9f-0db4f29fd5dd)

![Screenshot 2024-08-25 223617](https://github.com/user-attachments/assets/662b8167-b060-460a-9efd-6fa7d0f8c23a)

![Screenshot 2024-08-25 223612](https://github.com/user-attachments/assets/c3f23d55-30d9-4aae-874b-9ca7875c0741)

![Screenshot 2024-09-29 183159](https://github.com/user-attachments/assets/f8dc8b35-fec2-4a67-84f3-ebdd225e7ab9)

![Screenshot 2024-09-29 180505](https://github.com/user-attachments/assets/57d14279-7e87-411f-b8c5-210aacbff010)

![Screenshot 2024-09-10 194413](https://github.com/user-attachments/assets/a3658412-25e8-4540-bd11-88c6c88bd12e)

![Screenshot 2024-10-24 151549](https://github.com/user-attachments/assets/450adb52-9ed2-4a33-8c10-eeccb8a4334a)

![Screenshot 2024-09-10 201740](https://github.com/user-attachments/assets/2e0dd792-b3b7-474f-b977-d26239f4f6a4)

![Screenshot 2024-10-26 002030](https://github.com/user-attachments/assets/b8421102-8a11-43f2-adef-c7073e246a34)

![diagram-export-10-24-2024-3_18_06-PM](https://github.com/user-attachments/assets/65680869-6e58-4f14-9296-f4cb46860fdd)

![Screenshot 2024-10-27 175923](https://github.com/user-attachments/assets/51e94f42-8f51-401e-86d1-c40fbcfffba4)

![Screenshot 2024-10-27 174600](https://github.com/user-attachments/assets/e8f0c30a-4420-40b3-a7dd-f0eed573a463)
