import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import firebase from '../firebase';
import "./LoginRegister.css"

function LoginRegister() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isSignInClicked, setIsSignInClicked] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handleSignUp = () => {
    if (!validateFields()) {
      return;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userRef = firebase.firestore().collection('users').doc(user.uid);

        const userData = {
          email: user.email,
          displayName: fullName,
        };

        userRef
          .set(userData)
          .then(() => {
            navigate('/');
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          setSignupError('El correo electrónico ya está en uso');
          setLoginError('');
        } else {
          setSignupError('');
          setLoginError('');
        }
        console.error(error);
      });

    setIsSignInClicked(true);
  };

  const handleSignIn = () => {
    if (!validateFields()) {
      return;
    }

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log(userCredential.user);
        navigate('/');
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          setLoginError('Correo electrónico o contraseña incorrectos');
          setSignupError('');
        } else {
          setLoginError('');
          setSignupError('');
        }
        console.error(error);
      });

    setIsSignInClicked(true);
  };

  const handleChange = () => {
    setIsChecked(!isChecked);
    setErrors({});
    setEmailExists(false);
    setLoginError('');
    setSignupError('');
    setIsSignInClicked(false);
  };

  const validateFields = () => {
    const errors = {};

    if (!email) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(email)) {
      errors.email = 'Formato de correo electrónico inválido';
    }

    if (!password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (isChecked && !fullName) {
      errors.fullName = 'El nombre completo es obligatorio';
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  return (
    <div className="form-container">
      <div className="form">
      <div className="buttons">
        <label htmlFor="chbox" className="login btn">
          <span>Iniciar sesión</span>
        </label>
        <label htmlFor="chbox" className="SignUp btn">
          <span>Registrarse</span>
        </label>
      </div>

      <input type="checkbox" id="chbox" checked={isChecked} onChange={handleChange} />
      <div className="layer"></div>
      <div className="layer2"></div>

      <div className={isChecked ? 'SignUp_form' : 'login_form'}>
        <br />
        {isChecked && (
          <>
            <input
              type="text"
              value={fullName}
              onChange={handleFullNameChange}
              className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
              placeholder="Nombre completo"
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
            <br />
          </>
        )}
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className={`form-control ${errors.email || emailExists || signupError ? 'is-invalid' : ''}`}
          placeholder="Correo electrónico"
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        {emailExists && <div className="invalid-feedback">El correo electrónico ya está en uso</div>}
        {isSignInClicked && signupError && <div className="invalid-feedback">{signupError}</div>}
        <br />
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          placeholder="Contraseña"
        />
        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        {isSignInClicked && loginError && <div className="invalid-feedback">{loginError}</div>}
        <br />
        <button className="btn btn-primary" onClick={isChecked ? handleSignUp : handleSignIn}>
          {isChecked ? 'Registrarse' : 'Iniciar sesión'}
        </button>
      </div>
    </div>
    </div>
);
        }
export default LoginRegister;
