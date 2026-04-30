# Smart School Face Recognition Project

A comprehensive school management system featuring face recognition for attendance, student management, and automated notifications via WhatsApp and SMS.

## Project Structure

- `/backend`: FastAPI server, database models, and face recognition engine.
- `/frontend`: Next.js web application for the management dashboard.
- `docker-compose.yml`: For easy deployment of all services (Database, Redis, Evolution API).

## Features

- **Face Attendance**: Automated attendance tracking using computer vision.
- **Student Management**: Full CRUD for student records.
- **WhatsApp Integration**: Automated notifications and reminders.
- **Payment Tracking**: Fee management with Razorpay integration.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.10+
- Node.js 18+

### Setup

1. **Environment Variables**:
   - Copy `backend/.env.example` to `backend/.env` and fill in your credentials.
   
2. **Infrastructure**:
   ```bash
   docker-compose up -d
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment

This project is configured for deployment using Docker. Ensure all environment variables are correctly set in your production environment.