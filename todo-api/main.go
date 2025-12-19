package main

import (
	"fmt"
	"log"
	"net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	// Log the incoming request
	log.Printf("Request received: %s %s\n", r.Method, r.URL.Path)

	// Write the response header and body
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Hello, World!")
}

type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

func main() {
	// Register the handler function for the "/hello" path
	http.HandleFunc("/", helloHandler)

	// Log the server start message
	fmt.Println("Server starting on port 8080...")

	// Start the http server.
	// Passing nul as the second argument uses the default ServeMux.
	if err := http.ListenAndServe(":8080", nil); err != nil {
		// log any errors that prevent the server from starting
		log.Fatalf("Could not start server: %v\n", err)
	}

}
