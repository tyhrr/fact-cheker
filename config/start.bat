@echo off
echo Iniciando Croatian Labor Law Fact Checker...
echo.
echo Abriendo en el navegador predeterminado...
echo.

REM Intenta con diferentes puertos en caso de que uno esté ocupado
python -m http.server 8000 2>nul
if errorlevel 1 (
    python -m http.server 8001 2>nul
    if errorlevel 1 (
        python -m http.server 8002 2>nul
        if errorlevel 1 (
            echo Error: No se pudo iniciar el servidor.
            echo Asegurate de tener Python instalado.
            pause
            exit /b 1
        ) else (
            start http://localhost:8002
        )
    ) else (
        start http://localhost:8001
    )
) else (
    start http://localhost:8000
)

echo.
echo Servidor iniciado exitosamente!
echo Presiona Ctrl+C para detener el servidor.
echo.
pause
