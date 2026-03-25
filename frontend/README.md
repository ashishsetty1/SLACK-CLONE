# Slack Clone

A real-time full-stack chat application inspired by Slack.

## Features
- User registration and login
- JWT-based authentication
- Channel creation
- Real-time messaging with WebSockets
- Message history persistence
- Edit and delete your own messages
- Online user count
- Unread channel badges
- Responsive Slack-style UI

## Tech Stack
- Frontend: React, Axios, React Router
- Backend: FastAPI, SQLAlchemy
- Database: SQLite
- Auth: JWT
- Realtime: WebSockets

## Running Locally

### Backend
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload