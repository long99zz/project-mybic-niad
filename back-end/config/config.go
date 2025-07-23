package config

import (
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
)

type Config struct {
    DBHost     string
    DBPort     string
    DBUser     string
    DBPass     string
    DBName     string
    JWTSecret  string
    Port       string
}

func LoadConfig() *Config {
    // Load .env file
    if err := godotenv.Load(); err != nil {
        log.Println("Không tìm thấy file .env, dùng biến môi trường hệ thống.")
    }

    cfg := &Config{
        DBHost:    os.Getenv("DB_HOST"),
        DBPort:    os.Getenv("DB_PORT"),
        DBUser:    os.Getenv("DB_USER"),
        DBPass:    os.Getenv("DB_PASS"),
        DBName:    os.Getenv("DB_NAME"),
        JWTSecret: os.Getenv("JWT_SECRET"),
        Port:      os.Getenv("PORT"),
    }

    fmt.Println("DB_HOST:", cfg.DBHost)
    fmt.Println("DB_PORT:", cfg.DBPort)
    fmt.Println("DB_USER:", cfg.DBUser)
    fmt.Println("DB_PASS:", cfg.DBPass)
    fmt.Println("DB_NAME:", cfg.DBName)

    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local",
        cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBPort, cfg.DBName)
    fmt.Println("DSN:", dsn)

    return cfg
}