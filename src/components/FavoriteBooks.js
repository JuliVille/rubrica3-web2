import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import './Book.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function FavoriteBooks() {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      const user = firebase.auth().currentUser;

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
    };

    const fetchBooks = async () => {
      const bookRef = firebase.firestore().collection('books');

      const snapshot = await bookRef.get();
      const bookList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBooks(bookList);
    };

    const fetchAuthors = async () => {
      const authorRef = firebase.firestore().collection('authors');

      const snapshot = await authorRef.get();
      const authorList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAuthors(authorList);
    };

    fetchFavoriteBooks();
    fetchBooks();
    fetchAuthors();
  }, []);

  const getAuthor = (authorId) => {
    return authors.find((author) => author.id === authorId);
  };

  const removeFromFavorites = async (bookId) => {
    const user = firebase.auth().currentUser;

    if (user) {
      try {
        const favoritesRef = firebase.firestore().collection('favorites');
        const favoriteBookRef = favoritesRef.where('userId', '==', user.uid).where('bookId', '==', bookId);

        const snapshot = await favoriteBookRef.get();

        if (!snapshot.empty) {
          const favoriteDoc = snapshot.docs[0];
          await favoritesRef.doc(favoriteDoc.id).delete();
          console.log('Libro eliminado de favoritos correctamente');
        }
      } catch (error) {
        console.error('Error al eliminar el libro de favoritos:', error);
      }
    }
  };

  return (
    <div className='container-fluid mt-5'>
      <div className="row">
        {books.map((book) => {
          if (favoriteBooks.includes(book.id)) {
            const author = getAuthor(book.authorId);
            return (
              <div className="col-md-4 mb-2" key={book.id}>
                <div className="card">
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
                  <div className="card__footer">
                    <div className="favorite-icon-container favorite-icon">
                      <FontAwesomeIcon
                        icon={faStar}
                        color="yellow"
                        onClick={() => removeFromFavorites(book.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default FavoriteBooks;

