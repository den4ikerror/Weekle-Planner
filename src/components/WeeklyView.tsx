import { Week, Event } from '../types';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight, Plus, MoreVertical, Pencil, Trash2, Check } from 'lucide-react';
import { useState } from 'react';

interface WeeklyViewProps {
  weekData: Week;
  onDayClick: (date: string) => void;
  onCreateEvent: (date?: string) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleStatus: (eventId: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  isCurrentWeek: boolean;
}

export default function WeeklyView({
  weekData,
  onDayClick,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onToggleStatus,
  onPreviousWeek,
  onNextWeek,
  onToday,
  isCurrentWeek,
}: WeeklyViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Parse week start date
  const startDate = new Date(weekData.startDate);

  // Generate 7 days for the week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  // Helper to get events for a specific day
  const getEventsForDay = (dateStr: string) => {
    return weekData.events.filter(event => {
      const eventDate = event.startAt ? event.startAt.split('T')[0] : event.dueAt ? event.dueAt.split('T')[0] : '';
      return eventDate === dateStr;
    });
  };

  const totalTasks = weekData.events.length;
  const completedTasks = weekData.events.filter(e => e.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === event.id ? null : event.id);
  };

  return (
    <div className="space-y-6">
      {/* Week Header & Stats */}
      <div className="flex flex-col gap-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onPreviousWeek}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={onNextWeek}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            {!isCurrentWeek && (
              <button
                onClick={onToday}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={() => onCreateEvent()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Activity
          </button>
        </div>

        {/* Week Info & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-medium mb-1">
              <CalendarIcon className="w-5 h-5" />
              <span>Weekly Overview</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {new Date(weekData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(weekData.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{completedTasks} / {totalTasks} ({completionRate}%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map(day => {
          const dayEvents = getEventsForDay(day.dateStr);
          const isToday = day.dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={day.dateStr}
              className={`bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border transition-all duration-200 flex flex-col min-h-[350px] ${
                isToday
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="cursor-pointer" onClick={() => onDayClick(day.dateStr)}>
                  <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {day.dayName}
                  </span>
                  <div className={`text-xl font-bold ${isToday ? 'text-blue-500' : 'text-gray-900 dark:text-gray-100'}`}>
                    {day.dayNumber}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isToday && (
                    <span className="text-[10px] font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                  <button
                    onClick={() => onCreateEvent(day.dateStr)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Add activity"
                  >
                    <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                {dayEvents.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
                    No activities
                  </div>
                ) : (
                  dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`relative p-2.5 rounded-lg text-xs border transition-colors ${
                        event.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : event.status === 'in_progress'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div
                          className="flex-1 cursor-pointer min-w-0"
                          onClick={() => onDayClick(day.dateStr)}
                        >
                          <div className={`font-semibold truncate mb-1 ${event.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                            {event.title}
                          </div>
                          <div className="flex items-center justify-between text-[10px] opacity-80">
                            {event.startAt ? (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : (
                              <span>Task</span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold ${
                              event.priority === 'high' ? 'bg-red-500 text-white' : event.priority === 'medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                              {event.priority}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleEventClick(e, event)}
                          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Context Menu */}
                      {openMenuId === event.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(event.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {event.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEvent(event);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(event.id);
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
