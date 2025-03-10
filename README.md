
# Event Management System

BookingEvents is a comprehensive event management system developed with the goal of providing a secure process for
user registration and participation in events. The system allows for easy and secure registration, ensuring the protection
of user data. MongoDB is used for backend data management, while PostgreSQL is used for storing messages from live
chat. Database backups are implemented using Go language. Modern technologies such as Nginx, Docker, and
Kubernetes enable efficient and scalable infrastructure handling. CI/CD processes are implemented using GitHub Actions
and Jenkins



## **Backend:**

1. **Node.js**: JavaScript runtime for server-side programming.
2. **Express**: Web application framework for Node.js.
3. **Go**: Programming language for building high-performance backend services.
4. **Socket.IO**: Library for real-time and live chat functionality.
5. **JWT (jsonwebtoken)**: Library for handling authentication with JSON Web Tokens.
6. **Bcrypt**: Library for hashing passwords.
7. **Nodemailer**: Library for sending emails in Node.js applications.
8. **Cors**: Middleware for enabling Cross-Origin Resource Sharing.
9. **Helmet**: Security middleware for setting HTTP headers.
10. **Rate Limit**: Middleware for rate limiting requests.
11. **Body-Parser**: Middleware for parsing incoming request bodies.
12. **dotenv**: Module for loading environment variables from a .env file.
13. **Node Limits**: Module for managing file uploads and request limits.
14. **pgAdmin**: Web-based management tool for PostgreSQL.
15. **Mongoose**: ODM library for MongoDB.
16. **Swagger**: Tool for API documentation.
17. **QRCode**: Library for generating QR codes in Node.js.



## **Frontend:**

1. **React**: JavaScript library for building user interfaces.
2. **Tailwind CSS**: Utility-first CSS framework for styling components.
3.  **@yudiel/react-qr-scanner**: React component for scanning QR codes.

## **DevOps:**

1. **Docker**: Containerization platform for creating and managing containers.
2. **Kubernetes**: Container orchestration platform for automating deployment, scaling, and operations.
3. **Nginx**: Web server and reverse proxy for handling requests and providing additional security.
4. **Grafana**: Open-source platform for monitoring and observability, used for visualizing data.
5. **Prometheus**: Open-source system monitoring and alerting toolkit, integrated with Grafana for visualization.

## **Test:**

1. **Jest**: A testing framework used for writing and executing tests.
2. **@testing-library/react**: A library for testing React components, which allows rendering components.
3. **@testing-library/jest-dom**: An extension for Jest that adds useful matchers for testing DOM elements.
4. **supertest**: A library that allows making HTTP requests in tests and verifying responses.

## **Databases:**

1. **MongoDB**: NoSQL database for storing user accounts and events.
2. **PostgreSQL**: Relational database for structured data storage.
3. **Redis**: In-memory data structure store used as a database, cache, and message broker.


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

*For Kubernetes, you need to install the* **NGINX Ingress Controller**. *This can be done using either* **Helm** *or* **kubectl**.

```
npm run docker
npm run k8s
npm run k8s-DUS // Delete,Update,Start
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



<br>


### **Gallery**

| ![Image 1](https://github.com/user-attachments/assets/314b13f8-ada2-4b23-bf9f-0db4f29fd5dd) | ![Image 2](https://github.com/user-attachments/assets/662b8167-b060-460a-9efd-6fa7d0f8c23a) | ![Image 3](https://github.com/user-attachments/assets/c3f23d55-30d9-4aae-874b-9ca7875c0741) |
|-------------------------------------------------|-------------------------------------------------|-------------------------------------------------|
| ![Image 4](https://github.com/user-attachments/assets/5fe247f3-b24e-44f5-89e2-205f35eb49f7) | ![Image 5](https://github.com/user-attachments/assets/b1596a8f-bec0-4231-82a8-17f95a7aaec8) | ![Image 6](https://github.com/user-attachments/assets/3513839b-6519-49eb-ae0d-cb1f4205f25f) |
| ![Image 7](https://github.com/user-attachments/assets/450adb52-9ed2-4a33-8c10-eeccb8a4334a) | ![Image 8](https://github.com/user-attachments/assets/2e0dd792-b3b7-474f-b977-d26239f4f6a4) | ![Image 9](https://github.com/user-attachments/assets/11a7dc6e-0146-483b-b61c-07ebf4ff16b3) |
| ![Image 10](https://github.com/user-attachments/assets/1525b16b-7ca5-4364-bcce-06901483fc2d) | ![Image 11](https://github.com/user-attachments/assets/a7d5f5b5-b0d6-40d1-87d4-3cfaee3b7b90) | ![Image 12](https://github.com/user-attachments/assets/af3979d9-48c8-4fa9-abb9-ac58b9628694) |
| ![Image 13](https://github.com/user-attachments/assets/56a7447b-76be-4437-98f0-758d96955261) | ![Screenshot From 2025-02-18 15-05-29](https://github.com/user-attachments/assets/959e1d43-4060-4deb-9f18-98c6b772a9eb) | ![Screenshot From 2025-02-22 16-04-29](https://github.com/user-attachments/assets/a2efb14a-80d9-4fd9-9778-fe373ed9a13b) |

### **Additional Gallery**

| ![Image 14](https://github.com/user-attachments/assets/0a30ea63-a896-42ed-9caf-ec3435e3ddab) | ![Image 15](https://github.com/user-attachments/assets/51e94f42-8f51-401e-86d1-c40fbcfffba4) | ![Image 16](https://github.com/user-attachments/assets/e8f0c30a-4420-40b3-a7dd-f0eed573a463) |
|-------------------------------------------------|-------------------------------------------------|-------------------------------------------------|







## Folder structure


```
└── 📁backend
    └── 📁__mocks__
        └── fileMock.js
    └── 📁config
        └── .env
        └── redis.js
        └── test.config.js
    └── 📁docs
        └── accountSwagger.yaml
        └── adminSwagger.yaml
        └── eventSwagger.yaml
        └── healthCheckSwagger.yaml
    └── 📁go
        └── 📁config
            └── config.go
        └── .env
        └── Dockerfile.go.backend
        └── go.mod
        └── go.sum
        └── main.go
    └── 📁grafana
        └── DataSources.md
        └── grafanaAlert.yaml
        └── GrafanaModel.json
    └── 📁jenkins
        └── View&Security-freestyle.md
    └── 📁kubernetes
        └── configmap.yaml
        └── deployment.yaml
        └── HPA.yml
        └── ingress-nginx-deployment.yaml
        └── ingress.yaml
        └── network-policy.yaml
        └── persistentvolumeclaim.yaml
        └── persistentvolumes.yaml
        └── prometheus-rbac.yaml
        └── secret.yaml
        └── service.yaml
    └── 📁middleware
        └── auth.js
        └── metric.js
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
        └── 📁manuallyTests
            └── APITestK6LongTest.js
            └── APITestK6test.js
            └── metric_example.js
        └── 📁setup
            └── testSetup.js
        └── account.test.js
        └── event.test.js
        └── redis.test.js
        └── socketio.test.js
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
    └── jest.config.cjs
    └── jest.setup.mjs
    └── nginx.conf
    └── package-lock.json
    └── package.json
    └── server.js
    └── swaggerConfig.js
    └── ZAPToFix.md
```
```
└── 📁frontend
    └── 📁__mocks__
        └── styleMock.js
    └── 📁build
        └── 📁static
            └── 📁css
                └── main.ae835bc1.css
                └── main.ae835bc1.css.map
            └── 📁js
                └── main.359c69a9.js
                └── main.359c69a9.js.LICENSE.txt
                └── main.359c69a9.js.map
            └── 📁media
                └── hoverPhoto.b2e2ccbe84873d9b24be.gif
                └── Konferencija.7511b640952133852b1b.jpg
        └── asset-manifest.json
        └── index.html
        └── manifest.json
        └── robots.txt
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
        └── 📁config
            └── config.js
        └── 📁context
            └── AuthContext.js
        └── 📁routes
            └── AdminAddEvent.js
            └── ChangePassword.js
            └── Chat.js
            └── ForgotPassword.js
            └── HealthCheck.js
            └── Login.js
            └── Registration.js
            └── Unauthorized.js
        └── App.js
        └── index.css
        └── index.js
    └── 📁tests
        └── Card.test.js
    └── .babelrc
    └── .env
    └── .gitignore
    └── Dockerfile.frontend
    └── nginx.conf
    └── package-lock.json
    └── package.json
    └── README.md
    └── tailwind.config.js
    └── webpack.config.js
```
```
└── 📁.github
    └── 📁workflows
        └── deploy.yml
        └── run-tests.yml
        └── security-and-quality-check.yml
    └── dependabot.yml
```

```
└── 📁node_modules
└── .env
└── docker-compose.yml
└── package-lock.json
└── package.json
└── README.md
```
