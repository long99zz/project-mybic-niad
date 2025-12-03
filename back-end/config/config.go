package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Config struct {
	MongoURI  string
	DBName    string
	JWTSecret string
	Port      string
}

func LoadConfig() *Config {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Không tìm thấy file .env, dùng biến môi trường hệ thống.")
	}

	cfg := &Config{
		MongoURI:  os.Getenv("MONGO_URI"),
		DBName:    os.Getenv("DB_NAME"),
		JWTSecret: os.Getenv("JWT_SECRET"),
		Port:      os.Getenv("PORT"),
	}

	// Set default values if not provided
	if cfg.MongoURI == "" {
		cfg.MongoURI = "mongodb://localhost:27017"
	}
	if cfg.DBName == "" {
		cfg.DBName = "bic_insurance"
	}
	if cfg.Port == "" {
		cfg.Port = "5000"
	}

	fmt.Println("MongoDB URI:", cfg.MongoURI)
	fmt.Println("DB Name:", cfg.DBName)

	return cfg
}

func ConnectMongoDB(cfg *Config) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("không thể kết nối MongoDB: %v", err)
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("không thể ping MongoDB: %v", err)
	}

	log.Println("✅ Đã kết nối thành công với MongoDB!")
	return client, nil
}
