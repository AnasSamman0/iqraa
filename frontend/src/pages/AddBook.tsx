import { useContext, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Save, Upload, FileText, CheckCircle2, X } from 'lucide-react';
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
  const [error, setError] = useState('');

  if (user?.role !== 'admin') {
    return <Navigate to="/books" replace />;
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append('book', selectedFile);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return data;
    } catch (err) {
      console.error('File upload failed', err);
      throw new Error('فشل رفع الملف من جهازك');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let finalPdfUrl = pdfUrl;

      if (selectedFile) {
        const uploadedPath = await handleFileUpload();
        if (uploadedPath) {
          finalPdfUrl = uploadedPath;
        }
      }

      if (!finalPdfUrl) {
        throw new Error('يرجى اختيار ملف أو إدخال رابط الكتاب');
      }

      await api.post('/books', {
        title,
        pdfUrl: finalPdfUrl,
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

          <div className={`form-group file-upload-group ${selectedFile ? 'has-file' : ''}`}>
            {!selectedFile ? (
              <label className="file-upload-trigger">
                <Upload size={32} className="upload-icon" style={{ color: 'var(--accent)' }} />
                <span className="file-upload-button">اختر ملف من جهازك</span>
                <span className="file-upload-note">PDF, DOC, DOCX, EPUB (بحد أقصى 10MB)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.epub"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="file-input"
                />
              </label>
            ) : (
              <div className="selected-file-preview">
                <div className="file-info-header">
                  <FileText size={24} style={{ color: 'var(--accent)' }} />
                  <div className="file-details">
                    <span className="name">{selectedFile.name}</span>
                    <span className="size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file-btn"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="success-tag">
                  <CheckCircle2 size={14} />
                  جاهز للرفع
                </div>
              </div>
            )}
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

          <div className="book-checkbox-group">
            <label htmlFor="markFinished" className="book-checkbox-label">
              قديم
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
                  حفظ وإدراج الكتاب
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

