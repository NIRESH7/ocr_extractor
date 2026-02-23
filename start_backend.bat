@echo off
cd backend
if not exist venv (
    echo Virtual environment not found! Please run setup first.
    pause
    exit /b
)
call venv\Scripts\activate.bat
uvicorn main:app --reload
pause
