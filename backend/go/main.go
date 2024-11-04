package main

import (
	"context"
	"encoding/json"
	"events-api-go/config"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Event represents the structure of an event document in MongoDB
type Event struct {
	ID          primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	MongoID     primitive.ObjectID `json:"id" bson:"id,omitempty"`
	Price       string             `json:"price" bson:"price"`
	Title       string             `json:"title" bson:"title"`
	Description string             `json:"description" bson:"description"`
	Location    string             `json:"location" bson:"location"`
	MaxPeople   int                `json:"maxPeople" bson:"maxPeople"`
	TotalPeople int                `json:"totalPeople" bson:"totalPeople"`
	Date        time.Time          `json:"date" bson:"date"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
	Version     int                `json:"__v" bson:"__v"`
}

// Account represents the structure of an account document in MongoDB
type Account struct {
	ID        primitive.ObjectID   `json:"_id" bson:"_id,omitempty"`
	Email     string               `json:"email" bson:"email"`
	Password  string               `json:"password" bson:"password"`
	Events    []primitive.ObjectID `json:"events" bson:"events"`
	IsAdmin   bool                 `json:"isAdmin" bson:"isAdmin"`
	CreatedAt time.Time            `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time            `json:"updatedAt" bson:"updatedAt"`
	Version   int                  `json:"__v" bson:"__v"`
}

// saveToJSONFile saves data to a JSON file with the current date in the filename
func saveToJSONFile(data interface{}, filenamePrefix string) error {
	// Get the current date
	currentDate := time.Now().Format("2006-01-02")
	filename := fmt.Sprintf("%s_%s.json", filenamePrefix, currentDate)

	// Convert data to JSON with proper indentation
	jsonData, err := json.MarshalIndent(data, "", "    ")
	if err != nil {
		return fmt.Errorf("error marshaling JSON: %v", err)
	}

	// Write to file
	err = os.WriteFile(filename, jsonData, 0644)
	if err != nil {
		return fmt.Errorf("error writing to file: %v", err)
	}

	log.Printf("Successfully saved backup to %s", filename)
	return nil
}

func main() {
	// Load configuration settings
	cfg := config.LoadConfig()

	// Connect to MongoDB
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Test MongoDB connection
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("Could not ping MongoDB:", err)
	}
	log.Println("Successfully connected to MongoDB")

	// Get the events collection
	eventsCollection := client.Database("Node").Collection("events")
	log.Printf("Using database: Node, collection: events")

	// Get the accounts collection
	accountsCollection := client.Database("Node").Collection("accounts")
	log.Printf("Using database: Node, collection: accounts")

	http.HandleFunc("/view/events", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received request to /view/events")

		var events []Event

		// Retrieve all events from the database
		cursor, err := eventsCollection.Find(context.Background(), bson.D{})
		if err != nil {
			log.Printf("Error finding events: %v", err)
			http.Error(w, "Failed to fetch events", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.Background())

		// Decode retrieved events into the events slice
		if err = cursor.All(context.Background(), &events); err != nil {
			log.Printf("Error decoding events: %v", err)
			http.Error(w, "Failed to decode events", http.StatusInternalServerError)
			return
		}

		log.Printf("Found %d events", len(events))

		// Save events to JSON file with the current date in the filename
		if err := saveToJSONFile(events, "Events_Backup"); err != nil {
			log.Printf("Error saving backup: %v", err)
			// Continue processing even if backup fails
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(events)
	})

	http.HandleFunc("/view/accounts", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received request to /view/accounts")

		// Retrieve all accounts from the database
		cursor, err := accountsCollection.Find(context.Background(), bson.D{})
		if err != nil {
			log.Printf("Error finding accounts: %v", err)
			http.Error(w, "Failed to fetch accounts", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.Background())

		// Decode retrieved accounts into a slice
		var accounts []Account
		if err = cursor.All(context.Background(), &accounts); err != nil {
			log.Printf("Error decoding accounts: %v", err)
			http.Error(w, "Failed to decode accounts", http.StatusInternalServerError)
			return
		}

		log.Printf("Found %d accounts", len(accounts))

		// Save accounts to JSON file with the current date in the filename
		if err := saveToJSONFile(accounts, "Accounts_Backup"); err != nil {
			log.Printf("Error saving backup: %v", err)
			// Continue processing even if backup fails
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(accounts)
	})

	log.Println("Server starting on port 8181...")
	log.Fatal(http.ListenAndServe(":8181", nil))
}
