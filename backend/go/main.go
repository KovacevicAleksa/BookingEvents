package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"events-api-go/config"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoDB Structures

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

// PostgreSQL Structures

// PostgresData represents the combined structure for all PostgreSQL data
type PostgresData struct {
	Users    []User    `json:"users"`
	Rooms    []Room    `json:"rooms"`
	Messages []Message `json:"messages"`
}

// User represents the structure of a user in PostgreSQL
type User struct {
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// Room represents the structure of a room in PostgreSQL
type Room struct {
	RoomID    string    `json:"room_id"`
	RoomName  string    `json:"room_name"`
	CreatedAt time.Time `json:"created_at"`
}

// Message represents the structure of a message in PostgreSQL
type Message struct {
	MessageID string    `json:"message_id"`
	RoomID    string    `json:"room_id"`
	UserID    string    `json:"user_id"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// Helper Functions

// saveToJSONFile saves data to a JSON file in the persistent volume
// saveToJSONFile saves data to a JSON file in the persistent volume
func saveToJSONFile(data interface{}, filenamePrefix string) error {
	// Get the current date
	currentDate := time.Now().Format("2006-01-02")
	filename := fmt.Sprintf("%s_%s.json", filenamePrefix, currentDate)
	backupDir := "/data/db-backup"
	filepath := fmt.Sprintf("%s/%s", backupDir, filename)

	// Create backup directory if it doesn't exist
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return fmt.Errorf("error creating backup directory: %v", err)
	}

	// Convert data to JSON with proper indentation
	jsonData, err := json.MarshalIndent(data, "", "    ")
	if err != nil {
		return fmt.Errorf("error marshaling JSON: %v", err)
	}

	// Write to file in the persistent volume
	err = os.WriteFile(filepath, jsonData, 0644)
	if err != nil {
		return fmt.Errorf("error writing to file: %v", err)
	}

	log.Printf("Successfully saved backup to %s", filepath)
	return nil
}

// initPostgresDB initializes the PostgreSQL database connection
func initPostgresDB() (*sql.DB, error) {
	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=5432 sslmode=disable",
		os.Getenv("PG_HOST"),
		os.Getenv("PG_USER"),
		os.Getenv("PG_PASS"),
		os.Getenv("PG_DB"))

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error connecting to PostgreSQL: %v", err)
	}

	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("error pinging PostgreSQL: %v", err)
	}

	log.Println("Successfully connected to PostgreSQL")
	return db, nil
}

func main() {
	// Load configuration settings
	cfg := config.LoadConfig()

	// Initialize MongoDB connection
	mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Test MongoDB connection
	err = mongoClient.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("Could not ping MongoDB:", err)
	}
	log.Println("Successfully connected to MongoDB")

	// Initialize PostgreSQL connection
	postgresDB, err := initPostgresDB()
	if err != nil {
		log.Fatal(err)
	}
	defer postgresDB.Close()

	// Get MongoDB collections
	eventsCollection := mongoClient.Database("Node").Collection("events")
	accountsCollection := mongoClient.Database("Node").Collection("accounts")

	// MongoDB Events Route
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

	// MongoDB Accounts Route
	http.HandleFunc("/view/accounts", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received request to /view/accounts")

		var accounts []Account
		cursor, err := accountsCollection.Find(context.Background(), bson.D{})
		if err != nil {
			log.Printf("Error finding accounts: %v", err)
			http.Error(w, "Failed to fetch accounts", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.Background())

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

	// PostgreSQL Data Route
	http.HandleFunc("/view/postgres-data", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received request to /view/postgres-data")

		var pgData PostgresData

		// Fetch users
		usersQuery := `
			SELECT user_id, email, created_at 
			FROM message_system.users
			ORDER BY created_at`

		rows, err := postgresDB.Query(usersQuery)
		if err != nil {
			log.Printf("Error querying users: %v", err)
			http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var user User
			if err := rows.Scan(&user.UserID, &user.Email, &user.CreatedAt); err != nil {
				log.Printf("Error scanning user row: %v", err)
				continue
			}
			pgData.Users = append(pgData.Users, user)
		}

		// Fetch rooms
		roomsQuery := `
			SELECT room_id, room_name, created_at 
			FROM message_system.rooms
			ORDER BY created_at`

		rows, err = postgresDB.Query(roomsQuery)
		if err != nil {
			log.Printf("Error querying rooms: %v", err)
			http.Error(w, "Failed to fetch rooms", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var room Room
			if err := rows.Scan(&room.RoomID, &room.RoomName, &room.CreatedAt); err != nil {
				log.Printf("Error scanning room row: %v", err)
				continue
			}
			pgData.Rooms = append(pgData.Rooms, room)
		}

		// Fetch messages
		messagesQuery := `
			SELECT message_id, room_id, user_id, message, created_at 
			FROM message_system.messages
			ORDER BY created_at`

		rows, err = postgresDB.Query(messagesQuery)
		if err != nil {
			log.Printf("Error querying messages: %v", err)
			http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var message Message
			if err := rows.Scan(&message.MessageID, &message.RoomID, &message.UserID,
				&message.Message, &message.CreatedAt); err != nil {
				log.Printf("Error scanning message row: %v", err)
				continue
			}
			pgData.Messages = append(pgData.Messages, message)
		}

		log.Printf("Found %d users, %d rooms, and %d messages",
			len(pgData.Users), len(pgData.Rooms), len(pgData.Messages))

		if err := saveToJSONFile(pgData, "PostgreSQL_Backup"); err != nil {
			log.Printf("Error saving PostgreSQL backup: %v", err)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(pgData)
	})

	// Start the server
	log.Println("Server starting on port 8181...")
	log.Fatal(http.ListenAndServe(":8181", nil))
}
