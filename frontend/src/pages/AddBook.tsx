import { useContext, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Save, Upload, FileText, CheckCircle2, X, Image as ImageIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Books.css';

const AddBook = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [markAsFinishedForAll, setMarkAsFinishedForAll] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [error, setError] = useState('');

  if (user?.role !== 'admin') {
    return <Navigate to="/books" replace />;
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('book', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (err) {
      console.error('Upload failed', err);
      throw new Error(`فشل رفع الملف: ${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let finalPdfUrl = pdfUrl;
      let finalCoverUrl = '';

      if (selectedFile) {
        finalPdfUrl = await uploadFile(selectedFile);
      }

      if (selectedCover) {
        finalCoverUrl = await uploadFile(selectedCover);
      }

      if (!finalPdfUrl && !pdfUrl) {
        throw new Error('يرجى اختيار ملف أو إدخال رابط الكتاب');
      }

      await api.post('/books', {
        title,
        pdfUrl: finalPdfUrl,
        coverUrl: finalCoverUrl || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        markAsFinishedForAll,
      });

      navigate('/books', { replace: true });
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'فشل إضافة الكتاب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="books-content add-book-page animate-fade-in container">
      <div className="entry-page-header">
        <button type="button" className="entry-back-btn" onClick={() => navigate('/books')}>
          <ArrowRight size={16} />
          العودة إلى الكتب
        </button>
        <div>
          <h1>إضافة كتاب جديد</h1>
          <p className="subtitle">أدخل بيانات الكتاب وأرفق الملف المطلوب لنشره للمشتركين</p>
        </div>
      </div>

      <div className="entry-card glass-card">
        {error && <div className="entry-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="add-book-form book-modal-form">
          <div className="form-group">
            <label>عنوان الكتاب *</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="مثال: كتاب الأخلاق الإسلامية" 
            />
          </div>

          <div className="form-row">
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
            <div className="form-group">
              <label>تاريخ بداية القراءة</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          <div className="upload-sections-grid">
            {/* Book File Section */}
            <div className={`form-group file-upload-group ${selectedFile ? 'has-file' : ''}`}>
              <label className="section-small-label">ملف الكتاب (PDF/EPUB)</label>
              {!selectedFile ? (
                <label className="file-upload-trigger small">
                  <Upload size={24} style={{ color: 'var(--accent)' }} />
                  <span className="file-upload-button">اختر ملف</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.epub"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="file-input"
                  />
                </label>
              ) : (
                <div className="selected-file-preview mini">
                  <div className="file-info-header">
                    <FileText size={20} style={{ color: 'var(--accent)' }} />
                    <span className="name-brief">{selectedFile.name}</span>
                    <button type="button" className="remove-file-btn" onClick={() => setSelectedFile(null)}><X size={14} /></button>
                  </div>
                </div>
              )}
            </div>

            {/* Cover Image Section */}
            <div className={`form-group file-upload-group ${selectedCover ? 'has-file' : ''}`}>
              <label className="section-small-label">غلاف الكتاب (اختياري)</label>
              {!selectedCover ? (
                <label className="file-upload-trigger small">
                  <ImageIcon size={24} style={{ color: 'var(--accent)' }} />
                  <span className="file-upload-button">اختر صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedCover(e.target.files?.[0] || null)}
                    className="file-input"
                  />
                </label>
              ) : (
                <div className="selected-file-preview mini">
                  <div className="file-info-header">
                    <ImageIcon size={20} style={{ color: 'var(--accent)' }} />
                    <span className="name-brief">{selectedCover.name}</span>
                    <button type="button" className="remove-file-btn" onClick={() => setSelectedCover(null)}><X size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>تاريخ الانتهاء</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="book-checkbox-group" style={{ margin: 0, height: '100%', alignSelf: 'flex-end' }}>
              <label htmlFor="markFinished" className="book-checkbox-label" style={{ fontSize: '0.9rem' }}>
                كتاب قديم (قراءة منتهية)
              </label>
              <label className="premium-switch">
                <input
                  type="checkbox"
                  id="markFinished"
                  checked={markAsFinishedForAll}
                  onChange={(e) => setMarkAsFinishedForAll(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>

          <div className="entry-form-actions">
            <button type="button" className="cancel-btn entry-cancel-btn" onClick={() => navigate('/books')}>
              إلغاء
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="loader-spinner"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={18} />
                  إضافة ونشر الكتاب
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;


