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
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
