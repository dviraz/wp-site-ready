@echo off
setlocal EnableExtensions

rem ===============================================
rem Playwright Video Runner (Batch)
rem - Prompts for URL (default: http://localhost:3000)
rem - Choose Headless or Headful
rem - Prompts for duration (default: 12s)
rem - Uses record.mjs located in the same folder
rem - Outputs to .\recordings\video_YYYY-MM-DD_HH-mm-ss.webm
rem ===============================================

rem Ensure Node is available
where node >nul 2>&1
if errorlevel 1 (
  echo [!] Node.js not found in PATH. Please install Node 18+ and try again.
  pause
  exit /b 1
)

rem Ensure record.mjs exists in this folder
if not exist "%~dp0record.mjs" (
  echo [!] record.mjs not found in "%~dp0"
  echo     Make sure this script sits next to record.mjs.
  pause
  exit /b 1
)

rem -------- Start Servers --------
echo.
echo Starting servers...
echo [1/2] Starting frontend development server (npm start)...
start /min cmd /c "npm start"

echo [2/2] Starting XAMPP Control Panel...
start "" "C:\xampp\xampp-control.exe"

echo.
echo ⚠️  Please ensure both servers are running before proceeding:
echo     - Frontend: http://localhost:3000
echo     - WordPress API: http://localhost:8080/wordpress-api
echo.
pause

rem -------- Defaults --------
set "URL=http://localhost:3000"
set "OUTDIR=recordings"
set "WIDTH=1280"
set "HEIGHT=720"
set "DURATION=12"

rem -------- Prompt URL --------
echo.
set /p URL_IN=Target URL [default http://localhost:3000]: 
if not "%URL_IN%"=="" set "URL=%URL_IN%"

rem -------- Mode selection --------
echo.
echo Choose mode:
echo   [1] Headless (default) - fixed duration
echo   [2] Headful (visible browser window) - record until browser closed
set /p MODE=Enter 1 or 2: 
if "%MODE%"=="2" (
  set "MODEFLAG=--headful"
  set "DURATION=0"
  echo.
  echo ℹ️  Headful mode: Recording will continue until you close the browser window
) else (
  set "MODEFLAG="
  echo.
  set /p DURATION_IN=Duration in seconds [default 12]: 
  if not "%DURATION_IN%"=="" set "DURATION=%DURATION_IN%"
)

rem -------- Timestamped output filename --------
for /f %%i in ('powershell -NoProfile -Command "(Get-Date).ToString(\"yyyy-MM-dd_HH-mm-ss\")"') do set "TS=%%i"
set "OUTFILE=video_%TS%.webm"

rem -------- Ensure output directory exists --------
if not exist "%OUTDIR%" mkdir "%OUTDIR%"

echo.
echo ===============================================
echo  Starting recording
echo  URL:       %URL%
echo  Duration:  %DURATION% seconds
echo  Mode:      %MODE% %MODEFLAG%
echo  Size:      %WIDTH%x%HEIGHT%
echo  Output:    %OUTDIR%\%OUTFILE%
echo ===============================================
echo.

rem Run the recorder
node "%~dp0record.mjs" "%URL%" "%OUTDIR%" "%OUTFILE%" %DURATION% %WIDTH% %HEIGHT% %MODEFLAG%
set "ERR=%ERRORLEVEL%"

echo.
if "%ERR%"=="0" (
  echo ✅ Done.
  echo    Video:      %OUTDIR%\%OUTFILE%
  echo    Screenshot: %OUTDIR%\screenshot.png
) else (
  echo ❌ The recorder exited with code %ERR%.
)

echo.
pause
endlocal
