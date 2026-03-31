import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Search, Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Books.css';

const Books = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBooks = async () => {
    try {
      const { data } = await api.get('/books');
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleDeleteBook = async (id: string, bookTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف كتاب "${bookTitle}"؟`)) return;
    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل حذف الكتاب');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/books/${id}/toggle`);
      fetchBooks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل تحديث الحالة');
    }
  };

  const filtered = books.filter((b: any) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const getFullUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  return (
    <div className="books-content animate-fade-in container">
      <header className="page-header flex-header">
        <div>
          <h1>المقررات والكتب</h1>
          <p className="subtitle">تصفح مواد القراءة المتوفرة</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/books/new" className="primary-btn">
            <Plus size={18} /> إضافة كتاب
          </Link>
        )}
      </header>

      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="ابحث عن كتاب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">جاري تحميل الكتب...</div>
      ) : (
        <div className="books-grid">
          {filtered.map((book: any) => (
            <div key={book._id} className="book-card-wrapper">
              <Link to={`/books/${book._id}`} className="book-card-link">
                <div className="book-card">
                  <div className="book-cover-placeholder">
                    <BookOpen size={40} color="var(--accent)" />
                  </div>
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <div className="book-meta">
                      <span className={`status-badge ${book.status}`}>
                        {book.status === 'open' ? 'مفتوح' : 'مغلق'}
                      </span>
                      {book.startDate && (
                        <span className="date">
                          {new Date(book.startDate).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              {user?.role === 'admin' && (
                <div className="book-admin-actions">
                  <button
                    className="admin-mini-btn"
                    onClick={() => handleToggleStatus(book._id)}
                    title={book.status === 'open' ? 'إغلاق الكتاب' : 'فتح الكتاب'}
                  >
                    {book.status === 'open' ? <Lock size={16} /> : <Unlock size={16} />}
                    <span>{book.status === 'open' ? 'إغلاق' : 'فتح'}</span>
                  </button>
                  <button
                    className="admin-mini-btn delete"
                    onClick={() => handleDeleteBook(book._id, book.title)}
                    title="حذف الكتاب"
                  >
                    <Trash2 size={16} />
                    <span>حذف</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <BookOpen size={48} color="var(--border-color)" />
              <h3>{search ? 'لا توجد نتائج للبحث' : 'لا يوجد أي كتب بعد'}</h3>
              <p>{search ? 'جرب كلمة بحث أخرى' : 'قم بإضافة أول كتاب لـ محراب و كتاب من زر الإضافة أعلاه'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Books;
