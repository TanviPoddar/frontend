import React from 'react';
import IDE from './IDE';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Intelligent IDE</h1>
        <p>AI-Powered Developer Productivity</p>
        <p>Scroll down to start developing!!</p>
      </header>
      <main className="App-main">
        <IDE />
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Intelligent IDE - Powered by OpenAI API</p>
      </footer>
    </div>
  );
}

export default App;