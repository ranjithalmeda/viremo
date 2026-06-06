"use client";

import { useEffect, useState } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

type WatchHistoryItem = {
  date: string;
  count: number;
  entries: Array<{ title: string; type: string; watchedAt: string }>;
};

export function WatchHistoryCalendar() {
  const [historyData, setHistoryData] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState<
    Array<{ title: string; type: string; watchedAt: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const from = startOfMonth(now).toISOString().split("T")[0];
    const to = endOfMonth(now).toISOString().split("T")[0];

    fetch(`/api/watch-history?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => {
        const counts: Record<string, number> = {};
        if (data.grouped) {
          Object.entries(data.grouped).forEach(([date, entries]) => {
            counts[date] = (entries as Array<unknown>).length;
          });
        }
        setHistoryData(counts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch watch history:", err);
        setLoading(false);
      });
  }, []);

  const handleDayClick = async (date: string) => {
    setSelectedDate(date);
    try {
      const res = await fetch(`/api/watch-history?date=${date}`);
      const data = await res.json();
      const entries = (data.history || []).map(
        (item: {
          entry: { title: string; type: string };
          watchedAt: string;
        }) => ({
          title: item.entry.title,
          type: item.entry.type,
          watchedAt: item.watchedAt,
        }),
      );
      setSelectedDayEntries(entries);
    } catch (err) {
      console.error("Failed to fetch day entries:", err);
    }
  };

  if (loading) {
    return <div className="theme-muted text-sm">Loading watch history...</div>;
  }

  const now = new Date();
  const days = eachDayOfInterval({
    start: startOfMonth(now),
    end: endOfMonth(now),
  });

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-slate-100";
    if (count === 1) return "bg-violet-200";
    if (count === 2) return "bg-violet-400";
    return "bg-violet-600";
  };

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">
        Watch History
      </h2>

      {/* Calendar Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateStr = day.toISOString().split("T")[0];
            const count = historyData[dateStr] || 0;
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                className={`
                  h-10 rounded-lg text-sm font-medium transition-all
                  ${getIntensity(count)}
                  ${isSelected ? "ring-2 ring-offset-1 ring-violet-500" : ""}
                  hover:shadow-md
                `}
                title={`${count} item${count !== 1 ? "s" : ""} watched`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && selectedDayEntries.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <h3 className="font-semibold text-slate-900 mb-3">
            Watched on {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h3>
          <div className="space-y-2">
            {selectedDayEntries.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="text-xs font-semibold text-violet-600 px-2 py-1 bg-violet-50 rounded">
                  {entry.type}
                </span>
                <span className="text-slate-700">{entry.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedDayEntries.length === 0 && (
        <div className="text-center text-sm text-slate-500 py-4">
          No watch history recorded for this date.
        </div>
      )}
    </div>
  );
}
