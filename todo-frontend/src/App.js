import { useState, useEffect } from "react";

function App() {
  // useState Variables
  const [todos, setTodos] = useState([]); // for todos list
  const [newTitle, setNewTitle] = useState(""); // for input field

  // useEffect variables
  useEffect(() => {
    fetch("http://localhost:8080/todos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setTodos(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching todos:", error);
        setTodos([]);
      });
  }, []);

  // handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    if (newTitle.trim() === "") return; //don't add empty

    const response = await fetch("http://localhost:8080/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    if (response.ok) {
      const newTodo = await response.json();
      setTodos([...todos, newTodo]); // <- Instant UI update!
      setNewTitle(""); // clears input
    } else {
      console.error("Failed to add todo");
    }
  };

  // handleDelete function
  const handleDelete = async (id) => {
    const response = await fetch(`http://localhost:8080/todos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } else {
      console.error("Failed to delete todo:", id);
    }
  };

  return (
    <div>
      <h1>My Todo App</h1>
      <p>You have {todos.length} todos</p>
      <form onSubmit={handleSubmit} style={{ margin: "20px 0" }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter a new todo"
          style={{ padding: "10px", width: "300px", fontSize: "16px" }}
        />
        <button
          type="submit"
          style={{ padding: "10px 20px", fontSize: "16px", marginLeft: "10px" }}
        >
          Add Todo
        </button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              margin: "15px 0",
              padding: "10px",
              background: "#f9f9f9",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{todo.title}</span>
            <button
              onClick={() => handleDelete(todo.id)}
              style={{
                padding: "8px 16px",
                background: "#ff4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
