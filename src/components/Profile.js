import React, { useState } from 'react';
import firebase from '../firebase';

function Profile() {
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameNotification, setNameNotification] = useState(null);
  const [passwordNotification, setPasswordNotification] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleChangeName = (e) => {
    setNewName(e.target.value);
  };

  const handleChangePassword = (e) => {
    setNewPassword(e.target.value);
  };

  const showNameNotification = (message) => {
    setNameNotification(message);
    setTimeout(() => {
      setNameNotification(null);
    }, 3000);
  };

  const showPasswordNotification = (message) => {
    setPasswordNotification(message);
    setTimeout(() => {
      setPasswordNotification(null);
    }, 3000);
  };

  const handleUpdateName = (e) => {
    e.preventDefault();

    if (!newName) {
      showNameNotification('El nombre no puede estar vacío');
      return;
    }

    const user = firebase.auth().currentUser;

    if (user) {
      user
        .updateProfile({
          displayName: newName
        })
        .then(() => {
          console.log('Nombre actualizado correctamente');
          setNewName('');
          showNameNotification('Nombre cambiado correctamente');
        })
        .catch((error) => {
          console.error('Error al actualizar el nombre:', error);
        });
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();

    if (!newPassword) {
      showPasswordNotification('La contraseña no puede estar vacío');
      return;
    }

    if (newPassword.length < 6) {
      showPasswordNotification('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const user = firebase.auth().currentUser;

    if (user) {
      user
        .updatePassword(newPassword)
        .then(() => {
          console.log('Contraseña actualizada correctamente');
          setNewPassword('');
          showPasswordNotification('Contraseña cambiada correctamente');
        })
        .catch((error) => {
          console.error('Error al actualizar la contraseña:', error);
        });
    }
  };

  const handleDeleteAccount = () => {
    const user = firebase.auth().currentUser;

    if (user) {
      user
        .delete()
        .then(() => {
          console.log('Cuenta eliminada correctamente');
          setShowConfirmationModal(false);
          showNameNotification('Cuenta eliminada correctamente');
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        })
        .catch((error) => {
          console.error('Error al eliminar la cuenta:', error);
          showNameNotification('Error al eliminar la cuenta');
        });
    }
  };

  const toggleConfirmationModal = () => {
    setShowConfirmationModal(!showConfirmationModal);
  };

  return (
    <div className="container">
      <form className="needs-validation f-profile" noValidate>
        <h2 className="t-profile mt-5 text-center font-weight-bold">Perfil</h2>
        <div className="form-group">
          <label htmlFor="name" className="text-white font-weight-bold mt-2">Nuevo nombre:</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-lg"
              id="name"
              value={newName}
              onChange={handleChangeName}
              style={{ fontWeight: 'bold' }}
            />
            <div className="input-group-append">
              <button type="button" className="b-profile btn btn-primary" onClick={handleUpdateName}>Cambiar</button>
            </div>
          </div>
          {nameNotification && (
            <div className="alert alert-primary mt-2" role="alert">
              {nameNotification}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password" className="text-white font-weight-bold mt-5">Nueva contraseña:</label>
          <div className="input-group">
            <input
              type="password"
              className="form-control form-control-lg"
              id="password"
              value={newPassword}
              onChange={handleChangePassword}
              style={{ fontWeight: 'bold' }}
            />
            <div className="input-group-append">
              <button type="button" className="b-profile btn btn-primary" onClick={handleUpdatePassword}>Cambiar</button>
            </div>
          </div>
          {passwordNotification && (
            <div className="alert alert-primary mt-2" role="alert">
              {passwordNotification}
            </div>
          )}
        </div>
        <button type="button" className="btn btn-danger b-danger btn-lg mt-5 w-100" onClick={toggleConfirmationModal}>Eliminar cuenta</button>
      </form>
      {showConfirmationModal && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmación</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={toggleConfirmationModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary mt-5" onClick={toggleConfirmationModal}>Cancelar</button>
                <button type="button" className="btn btn-danger mt-5" onClick={handleDeleteAccount}>Eliminar cuenta</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
