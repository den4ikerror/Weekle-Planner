import { Calendar } from 'lucide-react';
import DataManagement from './DataManagement';

interface HeaderProps {
  currentView: 'weekly' | 'daily';
  onViewChange: (view: 'weekly' | 'daily') => void;
  onDataChanged: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function Header({ currentView, onViewChange, onDataChanged, addToast }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Weekly Planner</h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <nav className="flex gap-2">
              <button
                onClick={() => onViewChange('weekly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === 'weekly'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => onViewChange('daily')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === 'daily'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Day
              </button>
            </nav>

            <DataManagement onDataChanged={onDataChanged} addToast={addToast} />
          </div>
        </div>
      </div>
    </header>
  );
}
