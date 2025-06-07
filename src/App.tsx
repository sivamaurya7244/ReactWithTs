import React from 'react';
import logo from './logo.svg';
import './App.css';
import Custmor from './components/Custmor';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        
        <Custmor name="John Doe" title="Customer Service Representative" age={12}/>
      </header>
    </div>
  );
}

export default App;
