# Event Management System


This is an Event Management System that allows users to register and log in securely. Each user can register for one event only once. The system features dynamic loading of events from the database.<br>



## Technologies Backend

 - Node.js
 - bcrypt
 - cors
 - dotenv
 - express
 - mongodb
 - mongoose
 - nodemon
 - limits
 - helmet
 - express-rate-limit
 - bodyParser
 - eslint-plugin-security
 
> Start Backend **nodemon server.js**


## Technologies  Frontend

 - React
 - Tailwind

> Start Frontend **npm start**

## Folder structure
```
└── 📁backend
    └── .dockerignore
    └── .env
    └── .gitignore
    └── Dockerfile
    └── eslint.config.mjs
    └── 📁models
        └── account.js
        └── event.js
    └── package-lock.json
    └── package.json
    └── server.js
```
```
└── 📁frontend
    └── .gitignore
    └── package-lock.json
    └── package.json
    └── 📁public
        └── index.html
        └── manifest.json
        └── robots.txt
    └── README.md
    └── 📁src
        └── App.js
        └── 📁Components
            └── 📁assets
                └── Konferencija.jpg
            └── Card.js
            └── Header.js
            └── PrivateRoute.js
        └── index.css
        └── index.js
        └── 📁routes
            └── Login.js
            └── Registration.js
    └── tailwind.config.js
```
