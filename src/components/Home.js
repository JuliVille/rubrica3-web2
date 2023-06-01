import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { faPaperPlane, faAngleUp, faAngleDown, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

function Home() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState('');
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});

  useEffect(() => {
    const fetchBooks = () => {
      const bookRef = firebase.firestore().collection('books');

      const unsubscribe = bookRef.onSnapshot((snapshot) => {
        const bookList = snapshot.docs.map((doc) => {
          const bookData = { id: doc.id, ...doc.data() };

          firebase
            .firestore()
            .collection('comments')
            .where('bookId', '==', bookData.id)
            .onSnapshot((commentsSnapshot) => {
              const commentList = commentsSnapshot.docs.map((commentDoc) => ({
                id: commentDoc.id,
                ...commentDoc.data(),
              }));

              setComments((prevComments) => ({ ...prevComments, [bookData.id]: commentList }));
              setCommentCounts((prevCounts) => ({ ...prevCounts, [bookData.id]: commentList.length }));
            });

          return bookData;
        });

        setBooks(bookList);
      });

      return () => unsubscribe();
    };

    const fetchAuthors = () => {
      const authorRef = firebase.firestore().collection('authors');

      authorRef.onSnapshot((snapshot) => {
        const authorList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAuthors(authorList);
      });
    };

    fetchBooks();
    fetchAuthors();
  }, []);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const favoritesRef = firebase.firestore().collection('favorites');
      const userFavoritesRef = favoritesRef.where('userId', '==', user.uid);

      const unsubscribe = userFavoritesRef.onSnapshot((snapshot) => {
        const favoritesList = snapshot.docs.map((doc) => doc.data().bookId);
        setFavoriteBooks(favoritesList);
      });

      return () => unsubscribe();
    } else {
      setFavoriteBooks([]);
    }
  }, [user]);

  const handleAddComment = (bookId) => {
    if (commentText.trim() !== '') {
      const currentUser = firebase.auth().currentUser;

      if (!currentUser) {
        console.error('Usuario no autenticado');
        return;
      }

      const userId = currentUser.uid;

      // Obtener el nombre de usuario desde Firestore utilizando el ID del usuario
      firebase
        .firestore()
        .collection('users')
        .doc(userId)
        .get()
        .then((doc) => {
          const userName = doc.exists ? doc.data().displayName : 'Anónimo';

          if (editingCommentId) {
            firebase
              .firestore()
              .collection('comments')
              .doc(editingCommentId)
              .update({ comment: commentText })
              .then(() => {
                console.log('Comentario actualizado correctamente');
                setCommentText('');
                setEditingCommentId('');
              })
              .catch((error) => {
                console.error('Error al actualizar el comentario:', error);
              });
          } else {
            firebase
              .firestore()
              .collection('comments')
              .add({
                bookId,
                userId: userId,
                userName,
                comment: commentText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then(() => {
                console.log('Comentario agregado correctamente');
                setCommentText('');
              })
              .catch((error) => {
                console.error('Error al agregar el comentario:', error);
              });
          }
        })
        .catch((error) => {
          console.error('Error al obtener el nombre de usuario:', error);
        });
    }
  };




  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleEditComment = (commentId, comment) => {
    setCommentText(comment);
    setEditingCommentId(commentId);
  };

  const handleDeleteComment = (comment) => {
    firebase
      .firestore()
      .collection('comments')
      .doc(comment.id)
      .delete()
      .then(() => {
        console.log('Comentario eliminado correctamente');
      })
      .catch((error) => {
        console.error('Error al eliminar el comentario:', error);
      });
  };

  const handleAddToFavorites = (bookId) => {
    if (user) {
      const favoritesRef = firebase.firestore().collection('favorites');
      const favoriteBookRef = favoritesRef.where('userId', '==', user.uid).where('bookId', '==', bookId);

      favoriteBookRef.get().then((snapshot) => {
        if (snapshot.empty) {
          favoritesRef
            .add({
              userId: user.uid,
              bookId,
            })
            .then(() => {
              console.log('Libro agregado a favoritos correctamente');
            })
            .catch((error) => {
              console.error('Error al agregar el libro a favoritos:', error);
            });
        } else {
          const favoriteDoc = snapshot.docs[0];
          favoritesRef
            .doc(favoriteDoc.id)
            .delete()
            .then(() => {
              console.log('Libro eliminado de favoritos correctamente');
            })
            .catch((error) => {
              console.error('Error al eliminar el libro de favoritos:', error);
            });
        }
      });
    }
  };

  const handleToggleComments = () => {
    setShowComments((prevShowComments) => !prevShowComments);
  };

  return (
    <div className='container-fluid'>
      <h1 className='welcome-text text-center'>Bienvenido(a) a la página de inicio</h1>

      <div className="row">
        {books.map((book) => {
          const author = authors.find((author) => author.id === book.authorId);
          const isFavorite = favoriteBooks.includes(book.id);
          return (
            <div className="col-md-4 mb-4" key={book.id}>
              <div className="card">
                <div className="favorite-icon">
                  <div className="favorite-icon-container" onClick={() => handleAddToFavorites(book.id)}>
                    <FontAwesomeIcon
                      icon={isFavorite ? faStar : faStarRegular}
                      color={isFavorite ? 'yellow' : 'yellow'}
                    />
                  </div>
                </div>
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
                    <p className="description-container" style={{ overflowY: "scroll" }}>
                      <span style={{ fontWeight: "bold", fontSize: "16px" }}>Descripcion</span>: {book.description}
                    </p>
                    <div className="author-details" style={{ display: "flex" }}>
                      {author.imageUrl && <img className="author-image" src={author.imageUrl} alt={author.fullName} />}
                      <div className="author-name m-2" style={{ fontWeight: "bold", fontSize: "16px" }}>{author.fullName}</div>
                    </div>
                  </div>
                </div>
                <div className="c__footer ">
                  <div className="comments">
                    <div className="comment-section">
                      <div className="comment-list-scroll" style={{ overflowY: "scroll" }}>
                        {showComments && comments[book.id] ? (
                          comments[book.id].map((comment) => (
                            <div className="comment" key={comment.id}>
                              <div className="row">
                                <div className="col-9">
                                  <div className="comment-content">
                                    <p className="comment-text"><span style={{ fontWeight: "bolder" }}>{comment.userName}:</span> {comment.comment}</p>
                                  </div>
                                </div>
                                {user && user.uid === comment.userId && (
                                  <div className="col-3">
                                    <div className="comment-actions">
                                      <FontAwesomeIcon
                                        icon={faEdit}
                                        className="edit-icon"
                                        style={{ color: 'green', marginLeft: '2px', cursor: 'pointer' }}
                                        onClick={() => handleEditComment(comment.id, comment.comment)}
                                      />
                                      <FontAwesomeIcon
                                        icon={faTrashAlt}
                                        className="delete-icon"
                                        style={{ color: 'red', marginLeft: '2px', cursor: 'pointer' }}
                                        onClick={() => {
                                          const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este comentario?');
                                          if (confirmDelete) {
                                            handleDeleteComment(comment);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                          ))
                        ) : (
                          <p>{commentCounts[book.id] || 0} comentario(s)</p>
                        )}
                      </div>
                      {user && (
                        <div className="add-comment input-group">
                          <textarea
                            className="form-control"
                            placeholder="Agregar un comentario..."
                            value={commentText}
                            onChange={handleCommentChange}
                          />
                          <div className="input-group-append">
                            <button
                              className="btn btn-primary m-2"
                              onClick={() => handleAddComment(book.id)}
                            >
                              <FontAwesomeIcon
                                icon={editingCommentId ? faPaperPlane : faPaperPlane}
                                className="add-icon"
                              />{' '}
                              {editingCommentId ? '' : ''}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="comment-info">
                      <button className="btn btn-secondary" onClick={handleToggleComments}>
                        {showComments ? (
                          <FontAwesomeIcon icon={faAngleUp} />
                        ) : (
                          <FontAwesomeIcon icon={faAngleDown} />
                        )}{' '}
                        {showComments ? 'Ocultar comentarios' : 'Mostrar comentarios'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
