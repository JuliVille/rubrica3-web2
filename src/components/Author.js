import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import { faEdit, faTrash, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./Author.css"


function Author() {
  const [authors, setAuthors] = useState([]);
  const [fullName, setFullName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editAuthorId, setEditAuthorId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchAuthors = () => {
      const authorRef = firebase.firestore().collection('authors');

      const unsubscribe = authorRef.onSnapshot((snapshot) => {
        const authorList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAuthors(authorList);
      });

      return () => unsubscribe();
    };

    fetchAuthors();
  }, []);

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!fullName || !imageUrl) {
      return;
    }

    const authorData = {
      fullName: fullName,
      imageUrl: imageUrl
    };

    firebase
      .firestore()
      .collection('authors')
      .add(authorData)
      .then(() => {
        console.log('Autor agregado correctamente');
        setFullName('');
        setImageUrl('');
        setSubmitted(false);
      })
      .catch((error) => {
        console.error('Error al agregar el autor:', error);
        setSubmitted(false);
      });
    handleCancel();
  };

  const handleEdit = (author) => {
    setFullName(author.fullName);
    setImageUrl(author.imageUrl);
    setEditAuthorId(author.id);
  };

  const handleUpdate = () => {
    const authorRef = firebase.firestore().collection('authors').doc(editAuthorId);

    if (!fullName || !imageUrl) {
      return;
    }

    authorRef
      .update({
        fullName: fullName,
        imageUrl: imageUrl
      })
      .then(() => {
        console.log('Autor actualizado correctamente');
        setEditAuthorId('');
      })
      .catch((error) => {
        console.error('Error al actualizar el autor:', error);
      });
    handleCancel();
  };

  const handleDelete = (author) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este autor?');

    if (confirmDelete) {
      const authorRef = firebase.firestore().collection('authors').doc(author.id);
      authorRef
        .delete()
        .then(() => {
          console.log('Autor eliminado correctamente');
        })
        .catch((error) => {
          console.error('Error al eliminar el autor:', error);
        });
    }
  };

  const handleCancel = () => {
    setFullName('');
    setImageUrl('');
    setEditAuthorId(null);
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-md-3">
          <h2 className="Agregar-autor-text mt-5 mb-4" style={{ color: 'Yellow', fontWeight: 'bold', textAlign: 'center' }}>Agregar Autor</h2>
          <form onSubmit={handleSubmit} className="row g-3 needs-validation" noValidate >
            <div className="col-12">
              <input
                type="text"
                className={`form-control ${submitted && !fullName && 'is-invalid'}`}
                placeholder="Nombre completo"
                id="fullName"
                value={fullName}
                onChange={handleFullNameChange}
                required
              />
              {submitted && !fullName && <div className="invalid-feedback">Este campo es requerido.</div>}
            </div>
            <div className="col-12">
              <input
                type="text"
                className={`form-control ${submitted && !imageUrl && 'is-invalid'}`}
                placeholder="URL de la imagen"
                id="imageUrl"
                value={imageUrl}
                onChange={handleImageUrlChange}
                required
              />
              {submitted && !imageUrl && <div className="invalid-feedback">Este campo es requerido.</div>}
            </div>
            <div className="col-12 text-center">
              {editAuthorId ? (
                <div>
                  <button
                    type="button"
                    className="btn btn-primary mr-2 m-2"
                    onClick={handleUpdate}
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button type="submit" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faPaperPlane} />
                  Agregar
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="col-md-9">
          <div className="container row active-with-click">
            {authors.map((author) => (
              <div className="col-md-4 col-sm-6 col-xs-12" key={author.id}>
                <article className="material-card Red">
                  <h2 className="d-flex justify-content-between">
                    <span>{author.fullName}</span>
                    <div>
                      <FontAwesomeIcon
                        icon={faEdit}
                        className="icon-green clickable"
                        onClick={() => handleEdit(author)}
                      />
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="icon-red clickable"
                        onClick={() => handleDelete(author)}
                      />
                    </div>
                  </h2>
                  <div className="mc-content">
                    <div className="img-container">
                      <img
                        className="img-responsive"
                        src={author.imageUrl}
                        alt="Author"
                        onError={(e) => {
                          e.target.src = 'https://th.bing.com/th/id/R.085fa773f6d278ccc06e31bb2ac8d795?rik=jjgfRStSU7Zpfw&pid=ImgRaw&r=0';
                        }}
                      />
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>


  );
}

export default Author;