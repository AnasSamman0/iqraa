import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Search, Plus, X, Trash2, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Books.css';

const Books = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/books', {
        title,
        pdfUrl,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setShowAddModal(false);
      setTitle(''); setPdfUrl(''); setStartDate(''); setEndDate('');
      fetchBooks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل إضافة الكتاب');
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="books-content animate-fade-in">
      <header className="page-header flex-header">
        <div>
          <h1>المقررات والكتب</h1>
          <p className="subtitle">تصفح مواد القراءة المتوفرة</p>
        </div>
        {user?.role === 'admin' && (
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> إضافة كتاب
          </button>
        )}
      </header>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>إضافة كتاب لـ محراب و كتاب</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddBook} className="add-book-form">
              <div className="form-group">
                <label>عنوان الكتاب *</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: كتاب الأخلاق الإسلامية" />
              </div>
              <div className="form-group">
                <label>رابط الكتاب (PDF) *</label>
                <input type="url" required value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ بداية القراءة</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>تاريخ الانتهاء</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>إلغاء</button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : 'حفظ وإدراج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    className="toggle-btn"
                    onClick={() => handleToggleStatus(book._id)}
                    title={book.status === 'open' ? 'إغلاق الكتاب' : 'فتح الكتاب'}
                  >
                    {book.status === 'open' ? <Lock size={14} /> : <Unlock size={14} />}
                    {book.status === 'open' ? 'إغلاق' : 'فتح'}
                  </button>
                  <button
                    className="delete-book-btn"
                    onClick={() => handleDeleteBook(book._id, book.title)}
                    title="حذف الكتاب"
                  >
                    <Trash2 size={14} />
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
