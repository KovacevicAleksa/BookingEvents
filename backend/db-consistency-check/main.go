package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Load environment variables
	loadEnv()

	// Connect to MongoDB
	client := connectMongoDB()
	defer client.Disconnect(context.Background())

	// Select the collection
	collection := client.Database("Node").Collection("events")

	// Check for duplicate titles
	checkDuplicateTitles(collection)

	// Check for missing required fields
	requiredFields := []string{"owner", "id", "price", "title", "description", "location", "maxPeople", "totalPeople", "date"}
	checkMissingFields(collection, requiredFields)
}

// Loads environment variables from the .env file
func loadEnv() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
}

// Connects to MongoDB and returns the client
func connectMongoDB() *mongo.Client {
	MONGODB_URI := os.Getenv("MONGODB_URI")
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(MONGODB_URI))
	if err != nil {
		log.Fatal(err)
	}
	return client
}

// Checks for duplicate titles and prints them
func checkDuplicateTitles(collection *mongo.Collection) {
	pipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.M{"_id": "$title", "count": bson.M{"$sum": 1}}}},
		{{Key: "$match", Value: bson.M{"count": bson.M{"$gt": 1}}}},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.Background())

	fmt.Println("Duplicate titles:")
	for cursor.Next(context.Background()) {
		var result bson.M
		if err := cursor.Decode(&result); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Title: %s, Count: %v\n", result["_id"], result["count"])
	}
}

// Checks for documents missing required fields and prints them
func checkMissingFields(collection *mongo.Collection, fields []string) {
	queries := []bson.M{}
	for _, field := range fields {
		queries = append(queries, bson.M{field: bson.M{"$exists": false}})
	}

	missingFieldsCursor, err := collection.Find(context.Background(), bson.M{"$or": queries})
	if err != nil {
		log.Fatal(err)
	}
	defer missingFieldsCursor.Close(context.Background())

	fmt.Println("Documents with missing required fields:")
	for missingFieldsCursor.Next(context.Background()) {
		var result bson.M
		if err := missingFieldsCursor.Decode(&result); err != nil {
			log.Fatal(err)
		}
		fmt.Println(result)
	}
}
