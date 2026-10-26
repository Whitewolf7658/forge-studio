@echo off
setlocal
title Spectra Studio + Spectra Core (Private AI)
cd /d "%~dp0.."
echo.
echo  SPECTRA CORE - PRIVATE LOCAL STUDIO
echo  -----------------------------------
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Install Node 22 or later from https://nodejs.org/
  goto :stop
)
where py >nul 2>nul
if not errorlevel 1 (
  set "PYCOMMAND=py -3"
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python 3.11 or later is required: https://python.org/downloads/
    goto :stop
  )
  set "PYCOMMAND=python"
)
where ollama >nul 2>nul
if errorlevel 1 (
  echo Ollama was not found. Install from https://ollama.com/download/windows
  echo Then run: ollama pull qwen3:4b
  goto :stop
)
echo Checking local models...
ollama list
echo.
if not exist "node_modules" (
  echo Installing browser editor dependencies...
  call npm install
  if errorlevel 1 goto :stop
)
echo Building latest Spectra editor...
call npm run build
if errorlevel 1 goto :stop
echo.
echo Opening private editor: http://127.0.0.1:8765
echo AI calls never leave your PC unless you enable web research.
start "" "http://127.0.0.1:8765"
%PYCOMMAND% local_core\server.py
:stop
echo.
echo Spectra Core stopped or setup failed.
pause
endlocal
