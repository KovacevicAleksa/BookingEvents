Event Management System
Overview
This is an Event Management System that allows users to register and log in securely. Each user can register for one event only once. The system features dynamic loading of events from the database.

Technologies
Backend
Node.js
bcrypt: For password encryption.
cors: For handling Cross-Origin Resource Sharing.
dotenv: For environment variable management.
express: For building the RESTful API.
mongodb: For database management.
mongoose: For MongoDB object modeling.
Development Dependencies
nodemon: For automatically restarting the server during development.
Start Backend
To start the backend server, run the following command:

bash
Copy code
nodemon server.js
Frontend
React: For building the user interface.
Tailwind CSS: For styling the application.
Start Frontend
To start the frontend development server, run the following command:

bash
Copy code
npm start
Features
User Authentication: Secure login and registration using encrypted passwords.
Event Registration: Each user can register for one event only once.
Dynamic Event Loading: Events are dynamically loaded from the database.
Setup
Clone the repository.

Install backend dependencies:

bash
Copy code
cd backend
npm install
Install frontend dependencies:

bash
Copy code
cd frontend
npm install
Create a .env file in the backend directory and add your environment variables (e.g., MongoDB URI, secret keys).

Start the backend server:

bash
Copy code
nodemon server.js
Start the frontend server:

bash
Copy code
npm start
Folder Structure
arduino
Copy code
```
└── 📁backend
    └── .env
    └── .gitignore
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

Contributing
Fork the repository.

Create your feature branch:

bash
Copy code
git checkout -b feature/YourFeature
Commit your changes:

bash
Copy code
git commit -m 'Add some feature'
Push to the branch:

bash
Copy code
git push origin feature/YourFeature
Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
For any inquiries, please contact [your-email@example.com].
