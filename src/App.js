import React, { useState, useEffect } from 'react';
import './App.css';

const levels = [
  { color: 'green', label: '' },
  { color: 'orange', label: '1.ZA' },
  { color: 'red', label: '2.ZA' },
  { color: 'darkred', label: '3.ZA' },
];

function App() {
  const [names, setNames] = useState(() => {
    return JSON.parse(localStorage.getItem('names')) || [];
  });
  const [newName, setNewName] = useState('');

  useEffect(() => {
    localStorage.setItem('names', JSON.stringify(names));
  }, [names]);

  const addName = () => {
    if (newName.trim() === '') return;
    setNames([...names, { name: newName, level: 0 }]);
    setNewName('');
  };

  const deleteName = (index) => {
    const updated = [...names];
    updated.splice(index, 1);
    setNames(updated);
  };

  const moveUp = (index) => {
    if (names[index].level > 0) {
      const updated = [...names];
      updated[index].level -= 1;
      setNames(updated);
    }
  };

  const moveDown = (index) => {
    if (names[index].level < levels.length - 1) {
      const updated = [...names];
      updated[index].level += 1;
      setNames(updated);
    }
  };

  return (
    <div className="App">
      <h1>Haus der Regeln</h1>
      <div className="input-section">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name hinzufügen"
        />
        <button onClick={addName}>Hinzufügen</button>
      </div>
      <div className="house">
        {levels.map((level, levelIndex) => (
          <div key={level.color} className="floor" style={{ backgroundColor: level.color }}>
            <h2>{level.label}</h2>
            {names
              .filter((n) => n.level === levelIndex)
              .map((n, index) => (
                <div key={index} className="name">
                  {n.name}
                  <button onClick={() => moveUp(names.indexOf(n))}>⬇</button>
                  <button onClick={() => moveDown(names.indexOf(n))}>⬆</button>
                  <button onClick={() => deleteName(names.indexOf(n))}>🗑</button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
