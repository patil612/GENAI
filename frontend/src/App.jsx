import React, { useState, useRef, useCallback } from 'react';
import {
  Sparkles, FileText, ShieldAlert, CheckCircle, ChevronRight,
  Scale, ShieldCheck, Upload, X, FileUp, AlertCircle, Loader2,
  FilePlus2, FileSearch, Download, FileDown
} from 'lucide-react';

// ── Supported file types (mirrors backend) ──────────────────────────────────
const SUPPORTED_TYPES = [
  '.pdf', '.docx', '.doc', '.odt', '.rtf',
  '.txt', '.md', '.html', '.htm', '.xml', '.json', '.yaml', '.yml',
  '.log', '.ini', '.cfg',
  '.xlsx', '.xls', '.csv',
  '.pptx', '.ppt',
  '.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.webp', '.gif',
];

const FORMAT_LABELS = {
  Documents: ['PDF', 'DOCX', 'DOC', 'ODT', 'RTF'],
  'Plain Text': ['TXT', 'MD', 'HTML', 'XML', 'JSON', 'YAML', 'CSV'],
  Spreadsheets: ['XLSX', 'XLS', 'CSV'],
  Presentations: ['PPTX', 'PPT'],
  'Images (OCR)': ['PNG', 'JPG', 'JPEG', 'BMP', 'TIFF', 'WEBP', 'GIF'],
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ── File Upload Panel ────────────────────────────────────────────────────────
function FileUploadPanel({ label, icon: Icon, accentColor, value, onChange, placeholder }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const uploadFile = useCallback(async (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_TYPES.includes(ext)) {
      setError(`Unsupported format: ${ext.toUpperCase()}. Please use PDF, DOCX, TXT, XLSX, PPTX, images, and more.`);
      return;
    }

    setUploading(true);
    setError('');
    setFileInfo(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setFileInfo(data);

      if (data.success && data.extracted_text) {
        onChange(data.extracted_text);
      } else {
        setError(data.message || 'Could not extract text from file.');
      }
    } catch (e) {
      // Demo fallback: read plain text files locally
      if (file.type.startsWith('text/') || ext === '.txt' || ext === '.md' || ext === '.csv') {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target.result;
          onChange(text);
          setFileInfo({
            original_name: file.name,
            file_type: ext.slice(1).toUpperCase(),
            size_bytes: file.size,
            word_count: text.split(/\s+/).length,
            char_count: text.length,
            success: true,
            message: 'Read locally (backend offline)',
          });
        };
        reader.readAsText(file);
      } else {
        setError(`${e.message}. Make sure the backend is running at http://127.0.0.1:8000`);
      }
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const clearFile = () => {
    setFileInfo(null);
    setError('');
    onChange('');
  };

  const accentRing = accentColor === 'blue'
    ? 'focus:ring-blue-500/20 focus:border-blue-500'
    : 'focus:ring-indigo-500/20 focus:border-indigo-500';

  const accentBorder = accentColor === 'blue'
    ? 'border-blue-400 bg-blue-50/60'
    : 'border-indigo-400 bg-indigo-50/60';

  const accentIcon = accentColor === 'blue'
    ? 'bg-blue-100 text-blue-600'
    : 'bg-indigo-100 text-indigo-600';

  const accentBadge = accentColor === 'blue'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-indigo-100 text-indigo-700';

  return (
    <div
      className="glass rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1 flex flex-col gap-5"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {/* Panel Header */}
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl shadow-sm ${accentIcon}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{label}</h2>
          <p className="text-sm text-slate-500">{placeholder}</p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragging ? `${accentBorder} scale-[1.01]` : 'border-slate-200 hover:border-slate-300 bg-white/40'}
          ${uploading ? 'pointer-events-none' : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={SUPPORTED_TYPES.join(',')}
          onChange={onFileChange}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-600 font-medium">Extracting text…</p>
          </div>
        ) : fileInfo ? (
          <div className="flex items-center gap-4 px-5 py-4">
            <div className={`p-2 rounded-lg ${accentBadge}`}>
              <FileSearch className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{fileInfo.original_name}</p>
              <p className="text-xs text-slate-500 flex flex-wrap gap-3 mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${accentBadge}`}>
                  {fileInfo.file_type}
                </span>
                <span>{formatBytes(fileInfo.size_bytes)}</span>
                {fileInfo.word_count != null && (
                  <span>{fileInfo.word_count.toLocaleString()} words</span>
                )}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-2 select-none">
            <div className={`p-4 rounded-full mb-1 ${dragging ? accentBadge : 'bg-slate-100 text-slate-400'}`}>
              <FileUp className="w-7 h-7" />
            </div>
            <p className="font-semibold text-slate-700">
              {dragging ? 'Drop it here!' : 'Drop file or click to browse'}
            </p>
            <p className="text-xs text-slate-400">
              PDF, DOCX, TXT, XLSX, PPTX, HTML, images & more · Max 50 MB
            </p>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {fileInfo?.success && (
        <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm animate-in fade-in">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{fileInfo.message} · {fileInfo.char_count?.toLocaleString()} characters extracted.</span>
        </div>
      )}

      {/* Textarea fallback */}
      <div>
        <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Or type / paste text directly</p>
        <textarea
          className={`w-full h-40 p-4 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl outline-none resize-none transition-all text-slate-700 text-base shadow-inner ${accentRing} focus:ring-4`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste ${label.toLowerCase()} here…`}
        />
      </div>
    </div>
  );
}

// ── Supported Formats Chip Row ───────────────────────────────────────────────
function FormatChips() {
  const all = Object.values(FORMAT_LABELS).flat().slice(0, 18);
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      {all.map((fmt) => (
        <span
          key={fmt}
          className="px-3 py-1 text-xs font-semibold rounded-full bg-white/70 border border-slate-200 text-slate-600 shadow-sm backdrop-blur-sm"
        >
          {fmt}
        </span>
      ))}
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 shadow-sm">
        + more
      </span>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [contractText, setContractText] = useState('Payment for all invoices shall be made within 90 days of receipt.');
  const [policyText, setPolicyText] = useState('Standard payment terms are Net 30 days from the date of invoice receipt.');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(''); // 'docx' | 'txt' | ''
  const [contractName, setContractName] = useState('Contract');

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract_text: contractText, policy_text: policyText }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      // Demo fallback
      setTimeout(() => {
        setResults([{
          id: 1,
          original_clause: contractText.slice(0, 200),
          violated_policy: policyText.slice(0, 150),
          rewritten_clause: 'Payment for all invoices shall be made within 30 days of receipt.',
          explanation: 'Reduced payment term to comply with Net 30 policy.',
          risk_score: 0.85,
        }]);
        setLoading(false);
      }, 1500);
      return;
    }
    setLoading(false);
  };

  // ── Download handler ───────────────────────────────────────────────────────
  const handleDownload = async (fmt) => {
    setDownloading(fmt);
    const payload = {
      results,
      contract_name: contractName,
      format: fmt,
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/download/${fmt}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Download failed (${res.status})`);
      }

      // Get filename from Content-Disposition header
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `Auto-Redline_Report.${fmt}`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Offline fallback: download as TXT from browser
      if (fmt === 'txt') {
        const lines = [`AUTO-REDLINE REPORT — ${contractName}`, '='.repeat(60), ''];
        results.forEach((r, i) => {
          lines.push(`Violation ${i + 1} | Risk: ${Math.round(r.risk_score * 100)}/100`);
          lines.push(`Policy: ${r.violated_policy}`);
          lines.push(`Original: ${r.original_clause}`);
          lines.push(`Rewritten: ${r.rewritten_clause}`);
          lines.push(`Explanation: ${r.explanation}`);
          lines.push('='.repeat(60));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Auto-Redline_${contractName}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        alert(`Download error: ${err.message}\n\nTip: Try TXT download — it works offline.`);
      }
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 selection:bg-indigo-200">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold tracking-wide text-indigo-900 uppercase">Powered by Llama 3 GenAI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Auto-<span className="text-gradient">Redline</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload any document — PDF, Word, Excel, PowerPoint, images, and more — to instantly
            detect policy violations and auto-rewrite non-compliant clauses.
          </p>
        </header>

        {/* Supported Formats Strip */}
        <FormatChips />

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <FileUploadPanel
            label="Contract Text"
            icon={FileText}
            accentColor="blue"
            value={contractText}
            onChange={setContractText}
            placeholder="Upload contract file or paste clauses"
          />
          <FileUploadPanel
            label="Company Policy"
            icon={Scale}
            accentColor="indigo"
            value={policyText}
            onChange={setPolicyText}
            placeholder="Upload policy document or define compliance rules"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-16">
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || (!contractText.trim() && !policyText.trim())}
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-slate-900 rounded-2xl hover:bg-slate-800 hover:shadow-2xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative flex items-center gap-3 text-lg">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing with Llama 3…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze & Auto-Redline
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* ── Download Report Bar ── */}
            <div className="glass rounded-2xl px-6 py-5 mb-8 flex flex-wrap gap-4 items-center justify-between border border-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Download Redline Report</p>
                  <p className="text-xs text-slate-500">Save the full analysis as a formatted document</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Contract name input */}
                <input
                  id="contract-name-input"
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="Report name…"
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-700 w-44 transition-all"
                />

                {/* DOCX button */}
                <button
                  id="download-docx-btn"
                  onClick={() => handleDownload('docx')}
                  disabled={!!downloading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-indigo-200 hover:shadow-lg"
                >
                  {downloading === 'docx' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {downloading === 'docx' ? 'Generating…' : 'Download DOCX'}
                </button>

                {/* TXT button */}
                <button
                  id="download-txt-btn"
                  onClick={() => handleDownload('txt')}
                  disabled={!!downloading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-slate-200 hover:shadow-lg"
                >
                  {downloading === 'txt' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  {downloading === 'txt' ? 'Generating…' : 'Download TXT'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-extrabold text-slate-800">Analysis Results</h2>
              <div className="h-px bg-slate-200 flex-grow rounded"></div>
              <span className="text-sm font-semibold text-slate-500 shrink-0">
                {results.length} violation{results.length !== 1 ? 's' : ''} found
              </span>
            </div>

            <div className="space-y-8">
              {results.map((result, idx) => (
                <div key={idx} className="glass rounded-3xl overflow-hidden border border-slate-200/60 transition-all hover:shadow-2xl">
                  {/* Status Header */}
                  <div className="bg-white/80 border-b border-slate-100 px-8 py-5 flex flex-wrap gap-4 justify-between items-center backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-bold text-slate-800">Policy Violation Detected</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Risk Score</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${result.risk_score > 0.8 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {(result.risk_score * 100).toFixed(0)}/100
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Violated Policy Reference */}
                    <div className="mb-8">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Violated Policy Framework</h3>
                      <div className="border-l-4 border-indigo-500 pl-4 py-1">
                        <p className="text-lg font-medium text-slate-700">{result.violated_policy}</p>
                      </div>
                    </div>

                    {/* Redline Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative mb-8">
                      <div className="hidden md:flex absolute inset-y-0 left-1/2 items-center justify-center -ml-5 z-10">
                        <div className="bg-white p-2 rounded-full shadow-lg border border-slate-100 text-indigo-500">
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Original Clause */}
                      <div className="group">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-3">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Original Clause
                        </h3>
                        <div className="h-full p-6 bg-red-50/50 border border-red-100 rounded-2xl transition-colors group-hover:bg-red-50">
                          <p className="text-red-900/80 text-lg leading-relaxed line-through decoration-red-400 decoration-2">{result.original_clause}</p>
                        </div>
                      </div>

                      {/* Rewritten Clause */}
                      <div className="group">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          AI Rewritten Clause
                        </h3>
                        <div className="h-full p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl transition-colors group-hover:bg-emerald-50 shadow-sm shadow-emerald-100/50">
                          <p className="text-emerald-900 text-lg leading-relaxed font-medium">{result.rewritten_clause}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20 flex items-start gap-4">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">GenAI Explanation</h3>
                        <p className="text-slate-300 text-lg leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
