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
  const [markAsFinishedForAll, setMarkAsFinishedForAll] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleFileUpload = async () => {
    if (!selectedFile) return null;
    const formData = new FormData();
    formData.append('book', selectedFile);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data; // Returns the file path like /uploads/file.pdf
    } catch (err) {
      console.error('File upload failed', err);
      throw new Error('فشل رفع الملف من جهازك');
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalPdfUrl = pdfUrl;

      // If a file was selected, upload it first
      if (selectedFile) {
        const uploadedPath = await handleFileUpload();
        if (uploadedPath) {
          finalPdfUrl = uploadedPath;
        }
      }

      await api.post('/books', {
        title,
        pdfUrl: finalPdfUrl,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        markAsFinishedForAll,
      });
      setShowAddModal(false);
      setTitle(''); setPdfUrl(''); setStartDate(''); setEndDate('');
      setMarkAsFinishedForAll(false);
      setSelectedFile(null);
      fetchBooks();
    } catch (err: any) {
      alert(err.message || err.response?.data?.message || 'فشل إضافة الكتاب');
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

  const getFullUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

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
                <label>رابط الكتاب (Google Drive أو ويب)</label>
                <input 
                  type="text" 
                  value={pdfUrl} 
                  onChange={(e) => setPdfUrl(e.target.value)} 
                  placeholder="https://drive.google.com/..." 
                  disabled={!!selectedFile}
                />
              </div>

              <div className="form-group" style={{ border: '2px dashed var(--border-color)', padding: '15px', borderRadius: '12px', textAlign: 'center', background: selectedFile ? 'rgba(var(--accent-rgb), 0.05)' : 'transparent' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>أو ارفع ملف من جهازك</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.epub" 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="file-input"
                />
                {selectedFile && <p style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--accent)' }}>ملف مختار: {selectedFile.name}</p>}
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

              <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <input 
                  type="checkbox" 
                  id="markFinished" 
                  checked={markAsFinishedForAll} 
                  onChange={(e) => setMarkAsFinishedForAll(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="markFinished" style={{ cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  قديم
                </label>
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
