import { useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  return (
    <div>
      <h1>My Todo App</h1>
      <p>You have {todos.length} todos</p>
    </div>
  );
}

export default App;
