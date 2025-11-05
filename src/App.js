import React, { useState, useEffect } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

// === Firebase Config (dein eigener Key hier!) ===
const firebaseConfig = {
  apiKey: "AIzaSyDv-tfcJVlzosE-JD1NY26AnTQfSIx9DwI",
  authDomain: "haus-der-regeln.firebaseapp.com",
  databaseURL: "https://haus-der-regeln-default-rtdb.firebaseio.com",
  projectId: "haus-der-regeln",
  storageBucket: "haus-der-regeln.firebasestorage.app",
  messagingSenderId: "249015317662",
  appId: "1:249015317662:web:b58e533e796bd24a6bf78f"
};

// === Initialisierung ===
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const levels = [
  { color: 'green', label: '' },
  { color: 'orange', label: '1.ZA' },
  { color: 'red', label: '2.ZA' },
  { color: 'darkred', label: '3.ZA' },
];

// === Zwei gültige Passwörter ===
const VALID_PASSWORDS = ["A129cas7fa", "4379"];

function App() {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  // === Daten in Echtzeit abrufen ===
  useEffect(() => {
    const namesRef = ref(db, 'names');
    onValue(namesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNames(data);
      } else {
        setNames([]);
      }
    });
  }, []);

  // === Änderungen speichern ===
  const updateNames = (updated) => {
    set(ref(db, 'names'), updated);
  };

  const addName = () => {
    if (newName.trim() === '') return;
    const updated = [...names, { name: newName, level: 0 }];
    updateNames(updated);
    setNewName('');
  };

  const deleteName = (index) => {
    const updated = [...names];
    updated.splice(index, 1);
    updateNames(updated);
  };

  const moveUp = (index) => {
    if (names[index].level > 0) {
      const updated = [...names];
      updated[index].level -= 1;
      updateNames(updated);
    }
  };

  const moveDown = (index) => {
    if (names[index].level < levels.length - 1) {
      const updated = [...names];
      updated[index].level += 1;
      updateNames(updated);
    }
  };

  // === Passwortprüfung ===
  const handleLogin = () => {
    if (VALID_PASSWORDS.includes(inputPassword)) {
      setAuthenticated(true);
    } else {
      alert("Falsches Passwort!");
    }
  };

  if (!authenticated) {
    return (
      <div className="App">
        <h1>Haus der Regeln 🔒</h1>
        <input
          type="password"
          placeholder="Passwort eingeben"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

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
