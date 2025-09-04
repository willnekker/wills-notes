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

## Docker Deployment

### Setup

1. **Download and edit docker-compose file:**
```bash
curl -O https://raw.githubusercontent.com/willnekker/wills-notes/main/docker-compose.prod.yml
```

2. **Edit the docker-compose.prod.yml file and update these environment variables:**
- `JWT_SECRET` - Change to a secure random string
- `WEATHER_API_KEY` - Add your weather API key
- `OPENROUTER_API_KEY` - Add your OpenRouter API key

3. **Run the application:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

The app will be available at **http://localhost**

### Docker Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop application
docker-compose -f docker-compose.prod.yml down

# Update to latest version
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Backup data (from Docker volumes)
docker run --rm -v wills-notes-data:/data -v wills-notes-uploads:/uploads -v $(pwd):/backup alpine tar -czf /backup/wills-notes-backup-$(date +%Y%m%d).tar.gz -C / data uploads
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