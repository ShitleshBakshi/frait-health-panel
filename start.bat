@echo off
cd /d C:\eFRAIT\backend
call myenv\Scripts\activate.bat
uvicorn frait_health_backend.web.application:app --host 127.0.0.1 --port 8000