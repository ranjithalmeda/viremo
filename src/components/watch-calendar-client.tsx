"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
  isSameDay,
} from "date-fns";

type WatchHistoryItem = {
  id: string;
  entry: {
    id: string;
    title: string;
    type: string;
  };
  watchedAt: string;
};

type CalendarEntry = {
  id: string;
  title: string;
  type: string;
};

export function WatchCalendarClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [historyData, setHistoryData] = useState<Record<string, WatchHistoryItem[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingEntry, setAddingEntry] = useState(false);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [watchTime, setWatchTime] = useState("20:00");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMonthHistory = useCallback(async () => {
    const from = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const to = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    try {
      const res = await fetch(`/api/watch-history?from=${from}&to=${to}`);
      const data = await res.json();

      if (data.grouped) {
        setHistoryData(data.grouped);
      }
    } catch (err) {
      console.error("Failed to fetch watch history:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchMonthHistory();
  }, [fetchMonthHistory]);

  const fetchDayEntries = useCallback(async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch(`/api/watch-history?date=${dateStr}`);
      const data = await res.json();
      setSelectedDayEntries(data.history || []);
    } catch (err) {
      console.error("Failed to fetch day entries:", err);
    }
  }, []);

  const handleDayClick = async (date: Date) => {
    setSelectedDate(date);
    await fetchDayEntries(date);
  };

  const openLogModal = async () => {
    if (!selectedDate) return;

    setFormError(null);
    setAddingEntry(true);

    if (entries.length > 0) return;

    setEntriesLoading(true);
    try {
      const res = await fetch("/api/entries");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not load entries.");
      }

      setEntries(data);
      if (data[0]?.id) {
        setSelectedEntryId(data[0].id);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load entries.";
      setFormError(message);
    } finally {
      setEntriesLoading(false);
    }
  };

  const closeLogModal = () => {
    setAddingEntry(false);
    setFormError(null);
    setNote("");
  };

  const submitWatchLog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDate) return;
    if (!selectedEntryId) {
      setFormError("Choose an entry to log.");
      return;
    }

    if (!watchTime) {
      setFormError("Choose a watch time.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const date = format(selectedDate, "yyyy-MM-dd");
    const watchedAt = new Date(`${date}T${watchTime}:00`).toISOString();

    try {
      const res = await fetch("/api/watch-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId: selectedEntryId,
          watchedAt,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not log watch history.");
      }

      await fetchMonthHistory();
      await fetchDayEntries(selectedDate);
      closeLogModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not log watch history.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-slate-50 border-slate-200";
    if (count === 1) return "bg-violet-100 border-violet-200";
    if (count === 2) return "bg-violet-300 border-violet-400";
    if (count === 3) return "bg-violet-500 border-violet-600";
    return "bg-violet-600 border-violet-700";
  };

  const getTextColor = (count: number) => {
    if (count <= 2) return "text-slate-900";
    return "text-white";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-600">Loading calendar...</div>
      </div>
    );
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const daysInGrid = Array.from({ length: startOfMonth(currentMonth).getDay() }).fill(null);
  const allDays = [...daysInGrid, ...days];

  return (
    <>
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-8">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-950">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mb-8">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-slate-500 py-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {allDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-24 rounded-lg" />;
              }

              const dateStr = format(day as Date, "yyyy-MM-dd");
              const entries = historyData[dateStr] || [];
              const count = entries.length;
              const isSelected =
                selectedDate && isSameDay(day as Date, selectedDate);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(day as Date)}
                  className={`
                    h-24 p-2 rounded-lg border-2 transition-all
                    ${getIntensity(count)}
                    ${isSelected ? "ring-4 ring-violet-400 ring-offset-2" : ""}
                    hover:shadow-lg
                  `}
                >
                  <div className={`text-lg font-bold mb-1 ${getTextColor(count)}`}>
                    {(day as Date).getDate()}
                  </div>
                  {count > 0 && (
                    <div className={`text-xs font-semibold ${getTextColor(count)}`}>
                      {count} watched
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDate && (
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              <button
                onClick={openLogModal}
                className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
              >
                + Log entry
              </button>
            </div>

            {selectedDayEntries.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEntries.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:shadow-md transition-shadow"
                  >
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700">
                      {item.entry.type}
                    </span>
                    <span className="text-slate-900 font-semibold">{item.entry.title}</span>
                    <span className="ml-auto text-xs text-slate-500">
                      {new Date(item.watchedAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="mb-3">No watch history recorded for this date.</p>
                <button
                  onClick={openLogModal}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
                >
                  Add entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {addingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <form
            onSubmit={submitWatchLog}
            className="bg-white rounded-3xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Log entry for {selectedDate && format(selectedDate, "MMM d")}
            </h2>

            <div className="space-y-4">
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-2">
                  Entry
                </span>
                <select
                  value={selectedEntryId}
                  onChange={(event) => setSelectedEntryId(event.target.value)}
                  disabled={entriesLoading || submitting}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:bg-slate-100"
                >
                  {entriesLoading ? (
                    <option>Loading entries...</option>
                  ) : entries.length === 0 ? (
                    <option value="">No entries available</option>
                  ) : (
                    entries.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.title} ({entry.type})
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-2">
                  Time
                </span>
                <input
                  type="time"
                  value={watchTime}
                  onChange={(event) => setWatchTime(event.target.value)}
                  disabled={submitting}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:bg-slate-100"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-2">
                  Note
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={submitting}
                  rows={3}
                  placeholder="Optional note"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:bg-slate-100"
                />
              </label>

              {formError && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={closeLogModal}
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || entriesLoading || entries.length === 0}
                className="flex-1 px-4 py-3 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:bg-slate-300"
              >
                {submitting ? "Logging..." : "Log entry"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
