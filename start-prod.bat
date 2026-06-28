@echo off
REM ==========================================================
REM  自由时间指南灯 · Windows 生产模式启动
REM  1. 启动后端 (FastAPI)
REM  2. 用 FastAPI 自己托管前端 dist (无需 nginx)
REM ==========================================================
setlocal
cd /d "%~dp0"

echo [1/2] 启动后端(同时托管前端 dist) ...
start "freedombg" cmd /k "cd /d %~dp0backend && .venv\Scripts\python -m uvicorn backend.main:app --host 0.0.0.0 --port 8766"

echo.
echo  ============================================
echo   访问  -> http://127.0.0.1:8766
echo   API   -> http://127.0.0.1:8766/api
echo   Docs  -> http://127.0.0.1:8766/docs
echo  ============================================
echo.
endlocal
pause