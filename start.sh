#!/bin/bash
# ELWAKEL-SPORT Server Startup Script
# يقوم بتشغيل Backend و Frontend معاً

echo "🏟️ ELWAKEL-SPORT - Server Startup"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python is not installed. Please install Python 3.8+${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 14+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python and Node.js are installed${NC}"
echo ""

# Start Backend
echo -e "${YELLOW}Starting Backend (FastAPI)...${NC}"
cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate venv
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

# Install requirements
echo "Installing/Updating dependencies..."
pip install -q -r requirements.txt

# Start the backend server
echo -e "${GREEN}Starting uvicorn server...${NC}"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
sleep 2

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Backend running at: http://localhost:8000"
echo ""

# Start Frontend
cd ../frontend

echo -e "${YELLOW}Starting Frontend (Next.js)...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install -q
fi

# Start the frontend
echo -e "${GREEN}Starting Next.js development server...${NC}"
npm run dev &
FRONTEND_PID=$!
sleep 3

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "   Frontend running at: http://localhost:3000"
echo ""

echo "===================================="
echo -e "${GREEN}✨ Both servers are running!${NC}"
echo ""
echo "📍 Frontend:  http://localhost:3000"
echo "📍 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "Press CTRL+C to stop both servers"
echo "===================================="
echo ""

# Keep the script running
wait $BACKEND_PID $FRONTEND_PID
