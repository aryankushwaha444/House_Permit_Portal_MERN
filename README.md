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
House_Permit_Portal_MERN/
├── config/            # MongoDB connection
├── controllers/       # HTTP request handlers
├── middleware/        # Authentication, admin and error middleware
├── models/            # User and Permit schemas
├── routes/            # API endpoint definitions
├── services/          # Authentication and permit business logic
├── utils/             # Token and validation helpers
├── public/            # HTML, CSS, JavaScript and static assets
│   ├── css/
│   ├── js/common/
│   ├── js/pages/
│   └── assets/
├── uploads/           # Runtime uploaded documents (not committed)
└── server.js          # Application entry point
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

3. Copy `.env.example` to `.env` and set the following variables:
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
