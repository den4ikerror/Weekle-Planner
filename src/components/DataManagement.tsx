import { useState, useRef } from 'react';
import { db } from '../db/db';
import { Download, Upload, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DataManagementProps {
  onDataChanged: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function DataManagement({ onDataChanged, addToast }: DataManagementProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export JSON backup
  const handleExport = async () => {
    try {
      const allEvents = await db.events.toArray();
      const dataStr = JSON.stringify(allEvents, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `weekly-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('success', 'Backup exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      addToast('error', 'Failed to export backup');
    }
  };

  // Handle file select for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          throw new Error('Invalid backup format');
        }
        setImportPreview(json);
      } catch (error) {
        console.error('Parse failed:', error);
        addToast('error', 'Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Confirm import
  const handleConfirmImport = async () => {
    if (!importPreview) return;

    try {
      await db.transaction('rw', db.events, async () => {
        await db.events.clear();
        for (const ev of importPreview) {
          delete ev.id; // Let auto-increment assign new IDs
          await db.events.add(ev);
        }
      });
      localStorage.setItem('planner_initialized', 'true');
      setImportPreview(null);
      onDataChanged();
      addToast('success', 'Backup imported successfully');
    } catch (error) {
      console.error('Import failed:', error);
      addToast('error', 'Failed to import backup');
    }
  };

  // Clear all data
  const handleClearData = async () => {
    try {
      await db.events.clear();
      localStorage.removeItem('planner_initialized');
      setIsResetModalOpen(false);
      addToast('success', 'All personal data cleared');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Clear failed:', error);
      addToast('error', 'Failed to clear data');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        className="hidden"
      />

      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Export JSON Backup"
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Import JSON Backup"
      >
        <Upload className="w-3.5 h-3.5" />
        Import
      </button>

      <button
        onClick={() => setIsResetModalOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        title="Clear All Data"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Reset
      </button>

      {/* Import Preview Modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirm Import
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This backup contains <span className="font-semibold text-gray-900 dark:text-gray-100">{importPreview.length}</span> activities. Importing will replace all your current local data.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImportPreview(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Apply Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Clear All Data?
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete all your schedule data? This action cannot be undone unless you have exported a backup.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
