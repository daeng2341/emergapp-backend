# Emergency Response Application

A full-stack web application for emergency response management, allowing citizens to report emergencies and authorities to manage and respond to them.

## Features

- User authentication (citizens and authorities)
- Emergency reporting and management
- News and advisory updates
- Real-time status updates
- Profile management
- Role-based access control

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd emergency-app
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd ../server
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/emergency-app
JWT_SECRET=your-secret-key-here
```

5. Start the development servers:

Frontend:
```bash
cd client
npm start
```

Backend:
```bash
cd server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Users
- GET /api/users/me - Get user profile
- PUT /api/users/profile - Update user profile
- PUT /api/users/password - Change password

### Emergencies
- GET /api/emergencies - Get all emergencies
- GET /api/emergencies/:id - Get emergency by ID
- POST /api/emergencies - Create new emergency
- PATCH /api/emergencies/:id/status - Update emergency status
- PATCH /api/emergencies/:id/assign - Assign emergency

### News
- GET /api/news - Get all news
- GET /api/news/:id - Get news by ID
- POST /api/news - Create news (authority only)
- PUT /api/news/:id - Update news (authority only)
- DELETE /api/news/:id - Delete news (authority only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# emergapp-backend
pang thesis to oto
