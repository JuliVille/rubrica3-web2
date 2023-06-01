import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import firebase from './firebase';
import Home from './components/Home';
import Author from './components/Author';
import Book from './components/Book';
import FavoriteBooks from './components/FavoriteBooks';
import Profile from './components/Profile';
import LoginRegister from './components/LoginRegister';
import "./App.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('Cierre de sesión exitoso');
        setUser(null);
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  };

  return (
    <Router>
      <div className="navbar-container">
        {user && (
          <nav className="navbar navbar-expand-lg">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink to="/" className="nav-link" activeClassName="active">Inicio</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/author" className="nav-link" activeClassName="active">Administrar Autores</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/book" className="nav-link" activeClassName="active">Administrar Libros</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/favorites" className="nav-link" activeClassName="active">Libros Favoritos</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/profile" className="nav-link" activeClassName="active">Perfil</NavLink>
              </li>
              <li className="nav-item ml-auto">
                <button className="btn btn-link" onClick={handleSignOut}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span className="nav-link-text">Cerrar Sesión</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
        <Routes>
          {!user ? (
            <>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/author" element={<Author />} />
              <Route path="/book" element={<Book />} />
              <Route path="/favorites" element={<FavoriteBooks />} />
              <Route path="/profile" element={<Profile />} />
            </>
          )}
          <Route path="/login" element={<LoginRegister />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
