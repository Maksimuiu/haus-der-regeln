import React, { useState, useEffect } from 'react';
import './App.css';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDv-tfcJVlzosE-JD1NY26AnTQfSIx9DwI",
  authDomain: "haus-der-regeln.firebaseapp.com",
  databaseURL: "https://haus-der-regeln-default-rtdb.firebaseio.com",
  projectId: "haus-der-regeln",
  storageBucket: "haus-der-regeln.firebasestorage.app",
  messagingSenderId: "249015317662",
  appId: "1:249015317662:web:b58e533e796bd24a6bf78f",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const levels = [
  { color: 'green', label: '' },
  { color: 'orange', label: 'Warnung' },
  { color: 'red', label: '1.ZA' },
  { color: 'darkred', label: '2.ZA' },
];

const START_PASSWORDS = [
  { value: "ddwn", hidden: false },
  { value: "4379", hidden: true }
];

function App() {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState('');
  const [passwords, setPasswords] = useState([]);
  const [inputPassword, setInputPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordMenu, setShowPasswordMenu] = useState(false);

  useEffect(() => {
    const passwordsRef = ref(db, 'passwords');
    onValue(passwordsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPasswords(data);
      } else {
        set(ref(db, 'passwords'), START_PASSWORDS);
        setPasswords(START_PASSWORDS);
      }
    });

    const namesRef = ref(db, 'names');
    onValue(namesRef, (snapshot) => {
      const data = snapshot.val();
      setNames(data || []);
    });
  }, []);

  const updatePasswords = (updated) => set(ref(db, 'passwords'), updated);
  const updateNames = (updated) => set(ref(db, 'names'), updated);

  // Login
  const handleLogin = () => {
    if (!passwords || passwords.length === 0) {
      alert("Passwörter werden geladen, bitte warten...");
      return;
    }

    const trimmedInput = inputPassword.trim();
    const valid = passwords.some(p => p && p.value === trimmedInput);

    if (valid) {
      setAuthenticated(true);
    } else {
      alert("Falsches Passwort!");
    }
  };

  // Passwortverwaltung
  const addPassword = () => {
    if (!newPassword.trim()) return;
    updatePasswords([...passwords, { value: newPassword.trim(), hidden: false }]);
    setNewPassword('');
  };

  const deletePassword = (index) => {
    const updated = [...passwords];
    updated.splice(index, 1);
    updatePasswords(updated);
  };

  const changePassword = (index, newVal) => {
    const updated = [...passwords];
    updated[index].value = newVal;
    updatePasswords(updated);
  };

  // Namenverwaltung
  const addName = () => {
    if (!newName.trim()) return;
    updateNames([...names, { name: newName.trim(), level: 0 }]);
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

  // ✅ RESET BUTTON: Alle Namen auf Grün (Level 0)
  const resetAllLevels = () => {
    const updated = names.map(n => ({ ...n, level: 0 }));
    updateNames(updated);
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

      {/* Dropdown Menü für Passwortfunktionen */}
      <div className="dropdown">
        <button onClick={() => setShowPasswordMenu(!showPasswordMenu)}>
          🔑 Passwort-Optionen ▼
        </button>
        {showPasswordMenu && (
          <div className="dropdown-content">
            {passwords.map((p, i) => (
              <div key={i} className="password-item">
                {!p.hidden && (
                  <>
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => changePassword(i, e.target.value)}
                    />
                    <button onClick={() => deletePassword(i)}>🗑</button>
                  </>
                )}
              </div>
            ))}
            <div>
              <input
                type="text"
                placeholder="Neues Passwort"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={addPassword}>Hinzufügen</button>
            </div>
          </div>
        )}
      </div>

      <div className="input-section">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name hinzufügen"
        />
        <button onClick={addName}>Hinzufügen</button>
        {/*  Reset Button */}
        <button onClick={resetAllLevels} style={{ marginLeft: '10px', backgroundColor: '#4CAF50', color: 'white' }}>
           Alle auf Grün
        </button>
      </div>

      <div className="house">
        {levels.map((level, levelIndex) => (
          <div
            key={level.color}
            className="floor"
            style={{ backgroundColor: level.color }}
          >
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
