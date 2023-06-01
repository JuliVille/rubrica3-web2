import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './Book.css';

function Book() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [description, setDescription] = useState('');
  const [authors, setAuthors] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchBooks = () => {
      const bookRef = firebase.firestore().collection('books');

      const unsubscribe = bookRef.onSnapshot((snapshot) => {
        const bookList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBooks(bookList);
      });

      return () => unsubscribe();
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchAuthors = () => {
      const authorRef = firebase.firestore().collection('authors');

      authorRef.onSnapshot((snapshot) => {
        const authorList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAuthors(authorList);
      });
    };

    fetchAuthors();
  }, []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  const handleAuthorChange = (e) => {
    setAuthorId(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!title || !imageUrl || !authorId || !description) {
      return;
    }

    const bookData = {
      title: title,
      imageUrl: imageUrl,
      authorId: authorId,
      description: description
    };

    firebase
      .firestore()
      .collection('books')
      .add(bookData)
      .then(() => {
        console.log('Libro agregado correctamente');
        setTitle('');
        setImageUrl('');
        setAuthorId('');
        setDescription('');
        setSubmitted(false);
      })
      .catch((error) => {
        console.error('Error al agregar el libro:', error);
        setSubmitted(false);
      });
    handleCancelEdit();
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setImageUrl(book.imageUrl);
    setAuthorId(book.authorId);
    setDescription(book.description);
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
    setTitle('');
    setImageUrl('');
    setAuthorId('');
    setDescription('');
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!title || !imageUrl || !authorId || !description) {
      return;
    }

    const bookRef = firebase.firestore().collection('books').doc(editingBook.id);

    const updatedBookData = {
      title: title,
      imageUrl: imageUrl,
      authorId: authorId,
      description: description
    };

    bookRef
      .update(updatedBookData)
      .then(() => {
        console.log('Libro actualizado correctamente');
        setEditingBook(null);
        setTitle('');
        setImageUrl('');
        setAuthorId('');
        setDescription('');
      })
      .catch((error) => {
        console.error('Error al actualizar el libro:', error);
      });
    handleCancelEdit();
  };

  const handleDelete = (book) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este libro?');

    if (confirmDelete) {
      const bookRef = firebase.firestore().collection('books').doc(book.id);
      bookRef
        .delete()
        .then(() => {
          console.log('Libro eliminado correctamente');
        })
        .catch((error) => {
          console.error('Error al eliminar el libro:', error);
        });
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col-md-3">
          <h2 className="mt-5 mb-4" style={{ color: 'Yellow', fontWeight: 'bold', textAlign: 'center' }}>
            Agregar Libro
          </h2>
          {!editingBook ? (
            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
              <div className="mb-3">
                <label htmlFor="title" className="form-label" style={{ color: 'white', fontWeight: 'bold' }}>
                  Título:
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && !title && 'is-invalid'}`}
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  required
                />
                {submitted && !title && <div className="invalid-feedback">Este campo es requerido.</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="imageUrl" className="form-label" style={{ color: 'white', fontWeight: 'bold' }}>
                  URL de la imagen:
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && !imageUrl && 'is-invalid'}`}
                  id="imageUrl"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  required
                />
                {submitted && !imageUrl && <div className="invalid-feedback">Este campo es requerido.</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="authorId" className="form-label" style={{ color: 'white', fontWeight: 'bold' }}>
                  Autor:
                </label>
                <select
                  className={`form-select ${submitted && !authorId && 'is-invalid'}`}
                  id="authorId"
                  value={authorId}
                  onChange={handleAuthorChange}
                  required
                >
                  <option value="">Seleccione un autor</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.fullName}
                    </option>
                  ))}
                </select>
                {submitted && !authorId && <div className="invalid-feedback">Este campo es requerido.</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label" style={{ color: 'white', fontWeight: 'bold' }}>
                  Descripción:
                </label>
                <textarea
                  className={`form-control ${submitted && !description && 'is-invalid'}`}
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  required
                ></textarea>
                {submitted && !description && <div className="invalid-feedback">Este campo es requerido.</div>}
              </div>
              <button type="submit" className="btn btn-primary w-100">
                <FontAwesomeIcon icon={faPaperPlane} />
                Agregar
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdate} className="needs-validation" noValidate>
              <div className="mb-3">
                <label htmlFor="title" className="form-label" style={{ color: 'white', fontWeight: 'bold' }}>
                  Título:
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && !title && 'is-invalid'}`}
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  required
                />
                {submitted && !title && <div className="invalid-feedback">Este campo es requerido.</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="imageUrl" className="form-label" style={{ color: 'white', fontWeight: 'bold' }}>
                  URL de la imagen:
                </label>
                <input
                  type="text"
                  className={`form-control ${submitted && !imageUrl && 'is-invalid'}`}
                  id="imageUrl"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  required
                />
                {submitted && !imageUrl && <div className="invalid-feedback">Este campo es requerido.</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="authorId" className="form-label" style={{ color: 'white', fontWeight: 'bold' }}>
                  Autor:
                </label>
                <select
                  className={`form-select ${submitted && !authorId && 'is-invalid'}`}
                  id="authorId"
                  value={authorId}
                  onChange={handleAuthorChange}
                  required
                >
                  <option value="">Seleccione un autor</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.fullName}
                    </option>
                  ))}
                </select>
                {submitted && !authorId && <div className="invalid-feedback">Este campo es requerido.</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="description" style={{ color: 'white', fontWeight: 'bold' }} className="form-label">
                  Descripción:
                </label>
                <textarea
                  className={`form-control ${submitted && !description && 'is-invalid'}`}
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  required
                ></textarea>
                {submitted && !description && <div className="invalid-feedback">Este campo es requerido.</div>}
              </div>
              <button type="submit" className="btn btn-primary m-2">
                Actualizar
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                Cancelar
              </button>
            </form>
          )}
        </div>
        <div className="col-md-9">
          <div className="row">
            {books.map((book) => {
              const author = authors.find((author) => author.id === book.authorId);
              return (
                <div className="col-md-4 mb-4" key={book.id}>
                  <div className="card ">
                    <div className="card__header">
                      {book.imageUrl ? (
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          className='w-100'
                          style={{ maxHeight: "250px" }}
                          onError={(e) => {
                            e.target.src = 'https://th.bing.com/th/id/R.085fa773f6d278ccc06e31bb2ac8d795?rik=jjgfRStSU7Zpfw&pid=ImgRaw&r=0';
                          }}
                        />
                      ) : (
                        <img
                          src='https://th.bing.com/th/id/R.085fa773f6d278ccc06e31bb2ac8d795?rik=jjgfRStSU7Zpfw&pid=ImgRaw&r=0'
                          alt={book.title}
                          className='w-100'
                          style={{ maxHeight: "250px" }}
                        />
                      )}
                    </div>
                    <div className="card__body">
                      <h4 style={{ fontWeight: "bold" }}>{book.title}</h4>
                      <div className="author-info">
                        <div className="description-scroll">
                          <span style={{ fontWeight: "bold", fontSize: "16px" }}>Descripción:</span>
                          <div className="scrollable-description">{book.description}</div>
                        </div>
                      </div>
                    </div>
                    <div className="card__footer">
                      {author && (
                        <div className="author-details" style={{ display: "flex" }}>
                          {author.imageUrl && <img className="author-image" src={author.imageUrl} alt={author.fullName} />}
                          <div className="author-name m-2" style={{ fontWeight: "bold", fontSize: "16px" }}>{author.fullName}</div>
                        </div>
                      )}

                      {!editingBook ? (
                        <button onClick={() => handleEdit(book)} className="btn btn-success">
                          <FontAwesomeIcon icon={faEdit} />
                          Editar
                        </button>
                      ) : (
                        <button disabled className="btn btn-success">
                          <FontAwesomeIcon icon={faEdit} />
                          Editar
                        </button>
                      )}

                      <button onClick={() => handleDelete(book)} className="btn btn-danger">
                        <FontAwesomeIcon icon={faTrashAlt} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Book;
