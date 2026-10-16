import { Event } from '../types';
import { ArrowLeft, Clock, CheckCircle2, Circle, XCircle, AlertTriangle, Plus, MoreVertical, Pencil, Trash2, Check } from 'lucide-react';
import { useState } from 'react';

interface DailyViewProps {
  date: string;
  events: Event[];
  onBack: () => void;
  onCreateEvent: (date?: string) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleStatus: (eventId: string) => void;
}

export default function DailyView({
  date,
  events,
  onBack,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onToggleStatus
}: DailyViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const selectedDate = new Date(date);

  // Filter events for this day
  const dayEvents = events.filter(event => {
    const eventDate = event.startAt ? event.startAt.split('T')[0] : event.dueAt ? event.dueAt.split('T')[0] : '';
    return eventDate === date;
  });

  // Separate scheduled events and flexible tasks
  const scheduledEvents = dayEvents
    .filter(e => e.startAt)
    .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime());

  const flexibleTasks = dayEvents.filter(e => !e.startAt);

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in_progress':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      default:
        return 'text-green-500';
    }
  };

  const handleMenuClick = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === eventId ? null : eventId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Back to weekly view"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {dayEvents.length} {dayEvents.length === 1 ? 'item' : 'items'} scheduled
            </p>
          </div>
        </div>

        <button
          onClick={() => onCreateEvent(date)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Activity
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduled Events Timeline */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Clock className="w-5 h-5 text-blue-500" />
            Scheduled Events
          </h3>

          {scheduledEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No scheduled events for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledEvents.map(event => (
                <div
                  key={event.id}
                  className={`relative p-4 rounded-xl border transition-all duration-200 ${
                    event.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleStatus(event.id)}
                      className="mt-0.5 hover:scale-110 transition-transform"
                    >
                      {getStatusIcon(event.status)}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-semibold text-gray-900 dark:text-gray-100 ${event.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-semibold uppercase ${getPriorityColor(event.priority)}`}>
                            {event.priority}
                          </span>
                          <button
                            onClick={(e) => handleMenuClick(e, event.id)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(event.startAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {event.endAt && ` - ${new Date(event.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>

                        {event.category && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {event.category}
                          </span>
                        )}

                        {event.isRecurring && (
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Context Menu */}
                  {openMenuId === event.id && (
                    <div className="absolute right-4 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                      <button
                        onClick={() => {
                          onToggleStatus(event.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Check className="w-4 h-4" />
                        {event.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                      <button
                        onClick={() => {
                          onEditEvent(event);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDeleteEvent(event.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flexible Tasks */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Tasks</h3>

          {flexibleTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tasks for this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {flexibleTasks.map(task => (
                <div
                  key={task.id}
                  className={`relative p-3 rounded-lg border transition-all ${
                    task.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => onToggleStatus(task.id)}
                      className="mt-0.5 hover:scale-110 transition-transform"
                    >
                      {getStatusIcon(task.status)}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${task.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                          {task.title}
                        </h4>
                        <button
                          onClick={(e) => handleMenuClick(e, task.id)}
                          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-semibold uppercase ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>

                        {task.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Context Menu */}
                  {openMenuId === task.id && (
                    <div className="absolute right-3 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                      <button
                        onClick={() => {
                          onToggleStatus(task.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                      <button
                        onClick={() => {
                          onEditEvent(task);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDeleteEvent(task.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
