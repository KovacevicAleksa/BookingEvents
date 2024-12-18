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

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Access environment variables
	MONGODB_URI := os.Getenv("MONGODB_URI")

	// Establishing MongoDB connection
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(MONGODB_URI))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background()) // Ensure the connection is closed when main function finishes

	// Choosing the collection "events" from the "Node" database
	collection := client.Database("Node").Collection("events")

	// Corrected aggregation pipeline
	pipeline := mongo.Pipeline{
		{
			{Key: "$group", Value: bson.M{"_id": "$title", "count": bson.M{"$sum": 1}}},
		},
		{
			{Key: "$match", Value: bson.M{"count": bson.M{"$gt": 1}}},
		},
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
	if err := cursor.Err(); err != nil {
		log.Fatal(err)
	}

	// Check for events with missing owners
	missingOwnerCursor, err := collection.Find(context.Background(), bson.M{"owner": bson.M{"$exists": false}})
	if err != nil {
		log.Fatal(err)
	}
	defer missingOwnerCursor.Close(context.Background())

	fmt.Println("Events with missing owner:")
	for missingOwnerCursor.Next(context.Background()) {
		var result bson.M
		if err := missingOwnerCursor.Decode(&result); err != nil {
			log.Fatal(err)
		}
		fmt.Println(result)
	}
	if err := missingOwnerCursor.Err(); err != nil {
		log.Fatal(err)
	}
}
