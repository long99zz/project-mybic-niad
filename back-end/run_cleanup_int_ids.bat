@echo off
echo ========================================
echo   Cleanup Int ID Invoices Script
echo ========================================
echo.
echo This will DELETE all invoices with int IDs
echo Press Ctrl+C to cancel, or
pause
echo.

cd /d "%~dp0"
go run migrations\cleanup_int_ids.go

echo.
echo ========================================
echo   Script completed!
echo ========================================
pause
