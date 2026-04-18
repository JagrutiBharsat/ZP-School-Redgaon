# ZP School Redgaon - Student Management System

A comprehensive web-based student management system for ZP School Redgaon, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- **Student Management**: Add, edit, view, and delete student records
- **Attendance Tracking**: Mark and manage daily attendance with holiday support
- **Marks Management**: Record and track student marks across different exams
- **Academic Reports**: Generate comprehensive academic performance reports
- **Dashboard**: Overview of key metrics and statistics
- **Authentication**: Secure login and registration system with JWT

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Feather Icons

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Authentication middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── .env                   # Environment variables (not in git)
│   ├── .env.example           # Environment variables template
│   └── server.js              # Entry point
├── frontend/
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript files
│   │   └── config.js          # API configuration
│   ├── images/                # Image assets
│   └── *.html                 # HTML pages
├── vercel.json                # Vercel configuration
├── DEPLOYMENT.md              # Deployment instructions
└── README.md                  # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/JagrutiBharsat/ZP-School-Redgaon.git
cd ZP-School-Redgaon
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Configure Environment Variables**
```bash
cp .env.example .env
```
Edit `.env` and add your MongoDB connection string and JWT secret.

4. **Start Backend Server**
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

5. **Frontend Setup**
Open `frontend/login.html` in your browser or use a local server:
```bash
cd frontend
python -m http.server 3000
# or
npx serve
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/bulk` - Mark bulk attendance
- `GET /api/attendance/summary` - Get attendance summary

### Marks
- `GET /api/marks` - Get marks records
- `POST /api/marks/bulk` - Add bulk marks

### Holidays
- `GET /api/holidays` - Get all holidays
- `POST /api/holidays` - Add holiday
- `DELETE /api/holidays/:id` - Delete holiday
- `GET /api/holidays/check` - Check if date is holiday

### Reports
- `GET /api/reports` - Generate various reports

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Backend: Render
- Frontend: Vercel

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

## Features in Detail

### Student Management
- Add new students with complete details
- Edit existing student information
- View student profiles
- Delete student records
- Class-wise student listing

### Attendance System
- Daily attendance marking
- Holiday management
- Attendance reports
- Class-wise attendance tracking
- Automatic Sunday detection

### Marks Management
- Multiple exam support
- Subject-wise marks entry
- Bulk marks upload
- Performance tracking
- Grade calculation

### Reports
- Student-wise performance reports
- Class-wise reports
- Attendance summary
- Academic performance analysis
- Exportable reports

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- CORS configuration
- Environment variable protection

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

Jagruti Bharsat - [GitHub](https://github.com/JagrutiBharsat)

Project Link: [https://github.com/JagrutiBharsat/ZP-School-Redgaon](https://github.com/JagrutiBharsat/ZP-School-Redgaon)

## Acknowledgments

- Feather Icons for beautiful icons
- MongoDB Atlas for database hosting
- Vercel for frontend hosting
- Render for backend hosting
