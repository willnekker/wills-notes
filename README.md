# Wills Notes

A full-stack notes application with React frontend and Node.js backend.

## Features

- User authentication and authorization
- Create, read, update, and delete notes
- Notebook organization
- File attachments
- Search functionality
- Dashboard overview

## Tech Stack

**Frontend:**
- React 19
- Vite
- React Router
- Tailwind CSS
- Lucide React (icons)
- React Markdown

**Backend:**
- Node.js
- Express 5
- SQLite3
- JWT Authentication
- bcrypt for password hashing
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/willnekker/wills-notes.git
cd wills-notes
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The backend will run on http://localhost:3000

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

## Docker

### Using Docker Compose (Recommended)

```bash
docker-compose up --build
```

This will build and run both frontend and backend services.

### Building Individual Images

Backend:
```bash
docker build -t wills-notes-backend ./backend
```

Frontend:
```bash
docker build -t wills-notes-frontend ./frontend
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notebooks` - Get user's notebooks
- `POST /api/notebooks` - Create new notebook
- `GET /api/search` - Search notes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).