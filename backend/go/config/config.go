package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds the application configuration settings
type Config struct {
	MongoURI string
}

// LoadConfig loads environment variables and returns a Config instance
func LoadConfig() *Config {
	// Load environment variables from a .env file, if it exists
	err := godotenv.Load()
	if err != nil {
		log.Printf("Error loading .env file: %v", err)
	}

	return &Config{
		// Retrieve the MongoDB URI from environment or use default
		MongoURI: getEnv("MONGO_URI", "mongodb://localhost:27017"),
	}
}

// getEnv retrieves an environment variable or returns a fallback if it's not set
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
