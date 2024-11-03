package main

import (
    "log"
    "net/http"
)

func main() {
    http.HandleFunc("/view/events", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    })

    log.Printf("Server starting on port 8181...")
    log.Fatal(http.ListenAndServe(":8181", nil))
}