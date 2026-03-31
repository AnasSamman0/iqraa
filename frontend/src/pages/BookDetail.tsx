import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, CheckCircle, Clock, Heart, ArrowRight } from 'lucide-react';
import api from '../api';
import './BookDetail.css';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [book, setBook] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const fetchData = async () => {
    try {
      const [booksRes, subsRes] = await Promise.all([
        api.get('/books'),
        api.get(`/submissions/book/${id}`)
      ]);

      const found = booksRes.data.find((b: any) => b._id === id);
      if (!found) { navigate('/books'); return; }
      setBook(found);
      setSubmissions(subsRes.data);

      // Check if current student has already finished this book
      if (user?.role === 'student') {
        const mySubmission = subsRes.data.find((s: any) =>
          (s.userId._id || s.userId) === user._id
        );
        setIsFinished(!!mySubmission);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleMarkFinished = async () => {
    try {
      await api.post(`/books/${id}/finish`);
      alert('تم تسجيل إتمامك للكتاب بنجاح! يمكنك الآن إضافة مداخلتك.');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/submissions', {
        bookId: id,
        content,
        customDate: customDate || undefined,
      });
      setContent('');
      setCustomDate('');
      await fetchData();
      alert('تم إضافة مداخلتك بنجاح!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'يجب عليك تسجيل إتمام القراءة أولاً');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (subId: string) => {
    try {
      await api.post(`/submissions/${subId}/like`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  if (loading) return <div className="loading-state">جاري التحميل...</div>;
  if (!book) return <div className="loading-state">الكتاب غير موجود</div>;

  const mySubmission = submissions.find((s: any) =>
    (s.userId._id || s.userId) === user?._id
  );

  return (
    <div className="book-detail-content animate-fade-in">
      <button className="back-btn" onClick={() => navigate('/books')}>
        <ArrowRight size={16} /> العودة للكتب
      </button>

      <div className="book-header-section">
        <div className="book-cover-large">
          <BookOpen size={64} color="var(--accent)" />
        </div>
        <div className="book-title-info">
          <h1>{book.title}</h1>
          <div className="book-meta-tags">
            <span className={`status-badge ${book.status}`}>
              {book.status === 'open' ? 'مفتوح للمشاركة' : 'مغلق'}
            </span>
            {book.startDate && (
              <span className="date-badge">
                <Clock size={14} />
                البداية: {new Date(book.startDate).toLocaleDateString('ar-SA')}
              </span>
            )}
            {book.endDate && (
              <span className="date-badge">
                <Clock size={14} />
                الانتهاء: {new Date(book.endDate).toLocaleDateString('ar-SA')}
              </span>
            )}
          </div>

          <div className="book-actions">
            <button onClick={() => setShowViewer(!showViewer)} className="primary-btn">
              {showViewer ? 'إغلاق القارئ' : 'قراءة المحتوى الآن 📖'}
            </button>
            <a href={getFullUrl(book.pdfUrl)} target="_blank" rel="noreferrer" className="primary-btn outline">
              تحميل / فتح خارجي ↗
            </a>
            {user?.role === 'student' && !mySubmission && (
              <button onClick={handleMarkFinished} className="success-btn">
                <CheckCircle size={18} /> أنهيت القراءة
              </button>
            )}
          </div>
        </div>
      </div>

      {showViewer && (
        <div className="viewer-container animate-fade-in glass-card" style={{ height: '700px', padding: '10px', marginTop: '24px' }}>
          <iframe 
            src={book.pdfUrl.startsWith('http') ? `https://docs.google.com/viewer?url=${encodeURIComponent(book.pdfUrl)}&embedded=true` : getFullUrl(book.pdfUrl)}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
            title="Book Viewer"
          />
        </div>
      )}

      <div className="submissions-section">
        <h2>المداخلات والتأملات ({submissions.length})</h2>

        {/* Submission Form: show if student, book open, and no submission yet */}
        {user?.role === 'student' && book.status === 'open' && !mySubmission && (
          <form onSubmit={handleSubmitReflection} className="submission-form">
            <p className="form-hint">
              ⚠️ تأكد من الضغط على "أنهيت قراءة الكتاب" أولاً قبل إضافة مداخلتك
            </p>
            <textarea
              rows={5}
              placeholder="اكتب تأملاتك ومداخلتك حول هذا الكتاب..."
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="form-bottom-row">
              <div className="past-date-picker">
                <label>هل المداخلة قديمة؟ اختر تاريخها الحقيقي</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? 'جاري الإرسال...' : 'إضافة المداخلة'}
              </button>
            </div>
          </form>
        )}

        {mySubmission && user?.role === 'student' && (
          <div className="already-submitted">
            ✅ لقد أضفت مداخلتك لهذا الكتاب
          </div>
        )}

        <div className="submissions-list">
          {submissions.length === 0 ? (
            <div className="no-submissions">
              <p>لا توجد مداخلات بعد. كن أول من يشارك رأيه!</p>
            </div>
          ) : (
            submissions.map((sub: any) => (
              <div key={sub._id} className="submission-card">
                <div className="submission-header">
                  <div className="author-info">
                    <div className="avatar mini">{sub.userId?.name?.charAt(0) || '؟'}</div>
                    <strong>{sub.userId?.name || 'مستخدم'}</strong>
                  </div>
                  <span className="submission-date">
                    {sub.customDate
                      ? `📅 مداخلة قديمة - ${new Date(sub.customDate).toLocaleDateString('ar-SA')}`
                      : new Date(sub.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <p className="submission-content">{sub.content}</p>
                <div className="submission-footer">
                  <button
                    className={`like-btn ${sub.likedBy?.includes(user?._id) ? 'liked' : ''}`}
                    onClick={() => handleLike(sub._id)}
                  >
                    <Heart size={15} fill={sub.likedBy?.includes(user?._id) ? 'currentColor' : 'none'} />
                    {sub.likesCount > 0 && <span>{sub.likesCount}</span>}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
