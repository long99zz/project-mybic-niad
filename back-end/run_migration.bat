@echo off
echo ========================================
echo Running Master Invoice Migration
echo ========================================
echo.

cd migrations
go run migrate_to_master_invoice.go

echo.
echo ========================================
echo Migration Complete!
echo ========================================
pause
