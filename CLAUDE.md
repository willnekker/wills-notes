# Claude Context for Wills Notes & Weekly Task Manager Integration

## Project Overview
Two separate applications being tightly integrated:

1. **Wills Notes** - Full-stack notes app (React + Node.js + SQLite)
2. **Weekly Task Manager** - Weekly task management with drag & drop (React + Node.js + SQLite)

Both apps are containerized and deployed via GitHub Actions CI/CD.

## Current Status

### ✅ Completed
- **Wills Notes**: Single Docker image, CI/CD pipeline, GitHub Container Registry
- **Weekly Task Manager**: Separate repo, single Docker image, CI/CD pipeline  
- **Security**: Fixed leaked JWT secrets, proper environment variable handling
- **Documentation**: Complete Docker deployment instructions
- **Development Setup**: Both apps running in Docker containers

### Repository Structure
```
/home/willemnekker/wills-notes/          # Notes app repo
├── backend/                             # Node.js API server
├── frontend/                            # React frontend  
├── Dockerfile                           # Combined image (nginx + node)
├── docker-compose.prod.yml              # Production deployment
└── .github/workflows/ci-cd.yml          # GitHub Actions

/home/willemnekker/weekly-task-manager/  # Task manager repo
├── backend/                             # Node.js API server
├── frontend/                            # React frontend
├── Dockerfile                           # Combined image (nginx + node)
├── docker-compose.prod.yml              # Production deployment
└── .github/workflows/ci-cd.yml          # GitHub Actions
```

### Docker Images
- **Notes**: `ghcr.io/willnekker/wills-notes:latest` (port 80)
- **Tasks**: `ghcr.io/willnekker/weekly-task-manager:latest` (port 8080)

### Development Environment
```bash
# Notes App (port 80)
docker run -d -p 80:80 \
  -e JWT_SECRET="dev-jwt-secret" \
  -v wills-notes-data:/app/data \
  --name wills-notes-dev \
  ghcr.io/willnekker/wills-notes:latest

# Task Manager (port 8080) 
docker run -d -p 8080:80 \
  -e JWT_SECRET="dev-jwt-secret" \
  -e DEFAULT_ADMIN_PASSWORD="DevPassword123" \
  -e ADMIN_USERNAME="admin" \
  -v weekly-task-manager-data:/app/data \
  --name weekly-task-manager-dev \
  ghcr.io/willnekker/weekly-task-manager:latest
```

## Next Steps - Tight Integration

### Integration Goals
- **From Notes App**: Add "Create Task" button to link notes with tasks
- **From Task Manager**: Add "Link Note" button to associate notes with tasks
- **Cross-App Communication**: API calls between notes.willemnekker.com ↔ tasks.willemnekker.com
- **Unified UX**: Seamless navigation and data sharing

### Key Integration Points
1. **Notes → Tasks**: Create task from note content
2. **Tasks → Notes**: Link existing notes to tasks  
3. **Cross-linking**: Show linked items in both apps
4. **Shared Auth**: Consider JWT token sharing (if same domain)
5. **Visual Consistency**: Match UI/styling between apps

### Technical Architecture
- **Frontend**: Cross-origin API calls with CORS configuration
- **Backend**: New API endpoints for integration
- **Database**: Link tables (note_id ↔ task_id relationships)
- **Styling**: Both use Tailwind CSS for consistency

## Current Issues
- Notes app Docker container occasionally crashes - added better error handling
- Need to debug startup issues and ensure both apps run reliably

## Environment Variables

### Notes App
- `JWT_SECRET` (required)
- `WEATHER_API_KEY` (optional)  
- `OPENROUTER_API_KEY` (optional)

### Task Manager  
- `JWT_SECRET` (required)
- `DEFAULT_ADMIN_PASSWORD` (required)
- `ADMIN_USERNAME` (default: "willem")

## GitHub Repositories
- Notes: https://github.com/willnekker/wills-notes
- Tasks: https://github.com/willnekker/weekly-task-manager

Both have automated CI/CD that builds Docker images on push to main.