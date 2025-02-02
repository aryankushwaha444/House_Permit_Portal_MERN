# House Permit Application System

You can Visit mine Website: https://www.aaryankushawaha.com.np

## Features

- **User Authentication**
  - Secure registration and login system
  - JWT-based authentication
  - Password encryption using bcryptjs

- **User Dashboard**
  - View application status
  - Track permit applications
  - Update profile information

- **Admin Panel**
  - Using MangoDb for database operations , such as CRUD operations

- **Frontend**
  - HTML5
  - CSS3 (Modern UI with gradients and animations)
  - JavaScript (Vanilla JS)
  
- **Backend**
  - Node.js
  - Express.js
  - MongoDB (with Mongoose ODM)
  - JWT for authentication

## Project Structure

```
house-permit-system/
├── middleware/         # Authentication and request processing middleware
├── models/            # MongoDB schema models
├── public/            # Static files (HTML, CSS, JS, images)
│   ├── styles.css     # Global styles
│   ├── index.html     # Landing page
│   ├── login.html     # Login page
│   ├── register.html  # Registration page
│   └── permit-application.html  # Permit application form
├── routes/            # API routes
├── .env              # Environment variables
├── server.js         # Main application file
└── package.json      # Project dependencies
```

## Setup and Installation

1. Clone the repository
```bash
git clone <repository-url>
cd house-permit-system
```

2. Install dependencies
```bash
npm install
```

3. Create .env file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

4. Start the development server
```bash
npm run dev
```
## Security Features

- Password Hashing
- JWT Authentication
- Protected Routes
- Input Validation
- CORS Protection
# House-Permit-Portal-using-MERN
