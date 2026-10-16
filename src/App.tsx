import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { db } from './db/db';
import { getMonday, addWeeks, isSameWeek, formatDate } from './utils/dateUtils';
import Header from './components/Header';
import WeeklyView from './components/WeeklyView';
import DailyView from './components/DailyView';
import EventModal from './components/EventModal';
import ToastContainer, { ToastMessage } from './components/ToastContainer';
import { Week, Event } from './types';

type View = 'weekly' | 'daily';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('weekly');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [weekData, setWeekData] = useState<Week>({
    id: 'week-current',
    startDate: formatDate(getMonday(new Date())),
    endDate: formatDate(addWeeks(getMonday(new Date()), 0)),
    events: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast functions
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Load events from IndexedDB
  const loadWeekEvents = useCallback(async (weekStart: Date) => {
    const monday = getMonday(weekStart);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = formatDate(monday);
    const sundayStr = formatDate(sunday);

    try {
      const allEvents = await db.events.filter(e => !e.deletedAt).toArray();

      // Filter events for this week
      const weekEvents: Event[] = allEvents.map(e => ({
        id: e.id!.toString(),
        title: e.title,
        description: e.description,
        startAt: e.startAt,
        endAt: e.endAt,
        dueAt: e.dueAt,
        status: e.status,
        priority: e.priority,
        category: e.category,
        isRecurring: e.isRecurring,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })).filter(e => {
        const eventDate = e.startAt ? e.startAt.split('T')[0] : e.dueAt ? e.dueAt.split('T')[0] : '';
        return eventDate >= mondayStr && eventDate <= sundayStr;
      });

      setWeekData({
        id: `week-${mondayStr}`,
        startDate: mondayStr,
        endDate: sundayStr,
        events: weekEvents,
      });
    } catch (error) {
      console.error('Failed to load events from DB:', error);
      addToast('error', 'Failed to load schedule from local storage');
    }
  }, [addToast]);

  useEffect(() => {
    loadWeekEvents(currentWeekStart);
  }, [currentWeekStart, loadWeekEvents]);

  // Week navigation
  const goToPreviousWeek = useCallback(() => {
    const newWeekStart = addWeeks(currentWeekStart, -1);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  const goToNextWeek = useCallback(() => {
    const newWeekStart = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  const goToToday = useCallback(() => {
    const today = new Date();
    const todayWeekStart = getMonday(today);
    setCurrentWeekStart(todayWeekStart);
    addToast('info', 'Jumped to current week');
  }, [addToast]);

  const isCurrentWeek = isSameWeek(currentWeekStart, new Date());

  // Event CRUD operations
  const handleCreateEvent = useCallback((date?: string) => {
    setModalInitialDate(date);
    setEditingEvent(null);
    setIsModalOpen(true);
  }, []);

  const handleEditEvent = useCallback((event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleSaveEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();

      if (editingEvent) {
        await db.events.update(Number(editingEvent.id), {
          title: eventData.title,
          description: eventData.description,
          startAt: eventData.startAt,
          endAt: eventData.endAt,
          dueAt: eventData.dueAt,
          status: eventData.status,
          priority: eventData.priority,
          category: eventData.category,
          isRecurring: eventData.isRecurring || false,
          updatedAt: now,
        });

        addToast('success', 'Activity updated successfully');
      } else {
        await db.events.add({
          title: eventData.title,
          description: eventData.description,
          startAt: eventData.startAt,
          endAt: eventData.endAt,
          dueAt: eventData.dueAt,
          status: eventData.status,
          priority: eventData.priority,
          category: eventData.category,
          isRecurring: eventData.isRecurring || false,
          createdAt: now,
          updatedAt: now,
          deletedAt: '',
        });

        addToast('success', 'Activity created successfully');

        const eventDate = eventData.startAt ? eventData.startAt.split('T')[0] : eventData.dueAt ? eventData.dueAt.split('T')[0] : null;
        if (eventDate) {
          const eventWeekStart = getMonday(new Date(eventDate));
          if (!isSameWeek(eventWeekStart, currentWeekStart)) {
            setCurrentWeekStart(eventWeekStart);
            addToast('info', 'Switched to event week');
          }
        }
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      loadWeekEvents(currentWeekStart);
    } catch (error) {
      console.error('Failed to save event:', error);
      addToast('error', 'Failed to save activity');
    }
  }, [editingEvent, currentWeekStart, loadWeekEvents, addToast]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      await db.events.update(Number(eventId), { deletedAt: new Date().toISOString() });
      loadWeekEvents(currentWeekStart);
      addToast('success', 'Activity deleted');
    } catch (error) {
      console.error('Failed to delete event:', error);
      addToast('error', 'Failed to delete activity');
    }
  }, [currentWeekStart, loadWeekEvents, addToast]);

  const handleToggleStatus = useCallback(async (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const event = await db.events.get(Number(eventId));
      if (event) {
        const newStatus = event.status === 'completed' ? 'pending' : 'completed';
        await db.events.update(Number(eventId), {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
        loadWeekEvents(currentWeekStart);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      addToast('error', 'Failed to update status');
    }
  }, [currentWeekStart, loadWeekEvents, addToast]);

  // View navigation
  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setCurrentView('daily');
  };

  const handleBackToWeekly = () => {
    setCurrentView('weekly');
    setSelectedDate(null);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          onDataChanged={() => loadWeekEvents(currentWeekStart)}
          addToast={addToast}
        />

        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {currentView === 'weekly' ? (
            <WeeklyView
              weekData={weekData}
              onDayClick={handleDayClick}
              onCreateEvent={handleCreateEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onToggleStatus={handleToggleStatus}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={goToToday}
              isCurrentWeek={isCurrentWeek}
            />
          ) : (
            <DailyView
              date={selectedDate || weekData.startDate}
              events={weekData.events}
              onBack={handleBackToWeekly}
              onCreateEvent={handleCreateEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </main>

        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          initialDate={modalInitialDate}
          editEvent={editingEvent}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ThemeProvider>
  );
}
