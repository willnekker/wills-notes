# Wills Notes

A full-stack notes application with React frontend and Node.js backend.

## 🚀 Quick Start - Docker (Recommended)

**Minimal setup (no API keys needed):**

```bash
docker run -d -p 80:80 \
  -e JWT_SECRET=your-secure-jwt-secret-here \
  -v wills-notes-data:/app/data \
  -v wills-notes-uploads:/app/uploads \
  --name wills-notes \
  ghcr.io/willnekker/wills-notes:latest
```

**With optional API keys:**

```bash
docker run -d -p 80:80 \
  -e JWT_SECRET=your-secure-jwt-secret-here \
  -e WEATHER_API_KEY=your_weather_api_key_here \
  -e OPENROUTER_API_KEY=your_openrouter_api_key_here \
  -v wills-notes-data:/app/data \
  -v wills-notes-uploads:/app/uploads \
  --name wills-notes \
  ghcr.io/willnekker/wills-notes:latest
```

**App runs at:** http://localhost

## Features

- User authentication and authorization
- Create, read, update, and delete notes
- Notebook organization
- File attachments
- Search functionality
- Dashboard overview

## Tech Stack

**Frontend:** React 19, Vite, React Router, Tailwind CSS, Lucide React, React Markdown
**Backend:** Node.js, Express 5, SQLite3, JWT Authentication, bcrypt, Multer

## 🐳 Docker Management

### Run Commands

```bash
docker run -d -p 80:80 \
  -e JWT_SECRET=your-secure-jwt-secret-here \
  -e WEATHER_API_KEY=your_weather_api_key_here \
  -e OPENROUTER_API_KEY=your_openrouter_api_key_here \
  -v wills-notes-data:/app/data \
  -v wills-notes-uploads:/app/uploads \
  --name wills-notes \
  ghcr.io/willnekker/wills-notes:latest
```

The app will be available at **http://localhost**

### Docker Commands

```bash
# View logs
docker logs -f wills-notes

# Stop application
docker stop wills-notes

# Remove container
docker rm wills-notes

# Update to latest version
docker pull ghcr.io/willnekker/wills-notes:latest
docker stop wills-notes && docker rm wills-notes
# Then run the docker run command again

# Backup data
docker run --rm -v wills-notes-data:/data -v wills-notes-uploads:/uploads -v $(pwd):/backup alpine tar -czf /backup/wills-notes-backup-$(date +%Y%m%d).tar.gz -C / data uploads
```

### Docker Compose Alternative

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  wills-notes:
    image: ghcr.io/willnekker/wills-notes:latest
    ports:
      - "80:80"
    volumes:
      - wills-notes-data:/app/data
      - wills-notes-uploads:/app/uploads
    environment:
      - JWT_SECRET=your-secure-jwt-secret-here
      - PORT=3000
      - NODE_ENV=production
      - DB_SOURCE=data/notes.db
      - UPLOAD_DIR=./uploads
      - MAX_FILE_SIZE=10485760
      - WEATHER_API_KEY=your_weather_api_key_here
      - OPENROUTER_API_KEY=your_openrouter_api_key_here
    restart: unless-stopped

volumes:
  wills-notes-data:
  wills-notes-uploads:
```

Then run:
```bash
docker-compose up -d
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