package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
)

type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

var todos = []Todo{}
var nextID int = 1
var mu sync.Mutex

func Handler(w http.ResponseWriter, r *http.Request) {
	// Set headers for CORS (good practice even on Vercel)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Log request
	log.Printf("Request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

	// Handle preflight OPTIONS
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only handle /todos paths
	if !strings.HasPrefix(r.URL.Path, "/todos") && r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	// Route to your existing handler logic
	todosHandler(w, r)
}

// Your full existing todosHandler — copied exactly
func todosHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		if r.URL.Path == "/todos" || r.URL.Path == "/todos/" {
			mu.Lock()
			defer mu.Unlock()
			json.NewEncoder(w).Encode(todos)
		} else {
			// Get single todo
			idStr := strings.TrimPrefix(r.URL.Path, "/todos/")
			idStr = strings.TrimSuffix(idStr, "/")
			id, err := strconv.Atoi(idStr)
			if err != nil || id < 1 {
				http.Error(w, "Invalid todo ID", http.StatusBadRequest)
				return
			}

			mu.Lock()
			var found *Todo
			for _, t := range todos {
				if t.ID == id {
					found = &t
					break
				}
			}
			mu.Unlock()

			if found == nil {
				http.Error(w, "Todo not found", http.StatusNotFound)
				return
			}
			json.NewEncoder(w).Encode(found)
		}

	case http.MethodPost:
		if r.URL.Path != "/todos" && r.URL.Path != "/todos/" {
			http.Error(w, "Method not allowed on this path", http.StatusMethodNotAllowed)
			return
		}

		var input struct {
			Title string `json:"title"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		if input.Title == "" {
			http.Error(w, "Title is required", http.StatusBadRequest)
			return
		}

		mu.Lock()
		newTodo := Todo{
			ID:    nextID,
			Title: input.Title,
			Done:  false,
		}
		todos = append(todos, newTodo)
		nextID++
		mu.Unlock()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newTodo)

	case http.MethodDelete:
		idStr := strings.TrimPrefix(r.URL.Path, "/todos/")
		idStr = strings.TrimSuffix(idStr, "/")
		id, err := strconv.Atoi(idStr)
		if err != nil || id < 1 {
			http.Error(w, "Invalid todo ID", http.StatusBadRequest)
			return
		}

		mu.Lock()
		var deleted bool
		for i, t := range todos {
			if t.ID == id {
				todos = append(todos[:i], todos[i+1:]...)
				deleted = true
				break
			}
		}
		mu.Unlock()

		if !deleted {
			http.Error(w, "Todo not found", http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}