@echo off
REM ==========================================================
REM  自由时间指南灯 · Windows 一键启动脚本
REM ==========================================================
REM  双击运行即可同时启动后端 + 前端,默认端口:
REM    后端:  http://127.0.0.1:8766  (FastAPI / Uvicorn)
REM    前端:  http://127.0.0.1:5174  (Vite dev server)
REM
REM  生产模式请用 start-prod.bat
REM ==========================================================

setlocal
cd /d "%~dp0"

echo.
echo [1/3] 启动后端 (FastAPI) ...
start "freedombg-backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8766"

echo [2/3] 等待后端就绪 ...
timeout /t 3 /nobreak > nul

echo [3/3] 启动前端 (Vite) ...
start "freedombg-frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  ============================================
echo   后端  -> http://127.0.0.1:8766
echo   前端  -> http://127.0.0.1:5174
echo  ============================================
echo.
echo  关闭对应窗口即可停止服务
endlocal
pause