#!/bin/bash
# Kill any existing uvicorn process
pkill -f "uvicorn main:app" || true
sleep 2

# Source env if exists
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Run backend
source venv/bin/activate
python -m uvicorn main:app --reload
