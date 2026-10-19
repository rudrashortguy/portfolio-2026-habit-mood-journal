import { useState, useCallback } from 'react'
import { Sun, Cloud, Smile, Meh, Frown, Brain, BookOpen, Calendar, TrendingUp, Plus, CheckCircle2 } from 'lucide-react'

interface Habit {
  id: string
  name: string
  completed: boolean
}

interface DayData {
  mood: number | null
  habits: Habit[]
  journal: string
  timestamp: string
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function loadState(): Record<string, any> {
  try {
    const s = localStorage.getItem('mindflow-state')
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

const MOOD_OPTIONS = [
  { value: 1, label: 'Terrible', icon: Frown, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', ring: 'ring-red-500/50' },
  { value: 2, label: 'Bad', icon: Cloud, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', ring: 'ring-orange-500/50' },
  { value: 3, label: 'Okay', icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', ring: 'ring-yellow-500/50' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', ring: 'ring-green-500/50' },
  { value: 5, label: 'Great', icon: Sun, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', ring: 'ring-indigo-500/50' },
]

const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', name: 'Morning meditation', completed: false },
  { id: 'h2', name: 'Exercise', completed: false },
  { id: 'h3', name: 'Drink 8 glasses of water', completed: false },
  { id: 'h4', name: 'Read 30 minutes', completed: false },
  { id: 'h5', name: 'No screens before bed', completed: false },
]

export default function App() {
  const [state, setState] = useState<Record<string, any>>(loadState)
  const today = getToday()

  const dayData: DayData = state[today] || {
    mood: null,
    habits: DEFAULT_HABITS.map(h => ({ ...h, completed: false })),
    journal: '',
    timestamp: new Date().toISOString(),
  }

  const setDayData = useCallback((updater: Partial<DayData> | ((prev: DayData) => Partial<DayData>)) => {
    setState(prev => {
      const current = prev[today] || { mood: null, habits: DEFAULT_HABITS.map(h => ({ ...h, completed: false })), journal: '', timestamp: new Date().toISOString() }
      const newData = typeof updater === 'function' ? updater(current) : updater
      const merged: DayData = { ...current, ...newData }
      if (!merged.habits) merged.habits = current.habits
      const nextState = { ...prev, [today]: merged }
      try {
        localStorage.setItem('mindflow-state', JSON.stringify(nextState))
      } catch {}
      return nextState
    })
  }, [today])

  const allDays = Object.keys(state).sort()
  const entriesWithMood = allDays.filter(d => state[d]?.mood != null)
  const avgMood = entriesWithMood.length > 0
    ? (entriesWithMood.reduce((sum, d) => sum + state[d].mood, 0) / entriesWithMood.length).toFixed(1)
    : '—'
  const totalHabitsCompleted = entriesWithMood.reduce((sum, d) => sum + (state[d].habits?.filter((h: Habit) => h.completed).length || 0), 0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">MindFlow</h1>
              <p className="text-xs text-slate-400">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Offline ready</span>
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-slate-100">{avgMood}</p>
            <p className="text-xs text-slate-500">Avg Mood</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-lg font-bold text-slate-100">{totalHabitsCompleted}</p>
            <p className="text-xs text-slate-500">Habits Done</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-lg font-bold text-slate-100">{entriesWithMood.length}</p>
            <p className="text-xs text-slate-500">Days Tracked</p>
          </div>
        </div>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Smile className="w-4 h-4 text-yellow-400" />
            </div>
            <h2 className="font-semibold text-sm">How are you feeling?</h2>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const selected = dayData.mood === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setDayData({ mood: opt.value })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                    selected
                      ? `${opt.bg} ${opt.border} ring-2 ${opt.ring}`
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${selected ? opt.color : 'text-slate-500'}`} />
                  <span className={`text-xs ${selected ? opt.color : 'text-slate-500'}`}>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="font-semibold text-sm">Today's Habits</h2>
            </div>
            <span className="text-xs text-slate-500">
              {dayData.habits.filter((h: Habit) => h.completed).length}/{dayData.habits.length}
            </span>
          </div>

          <div className="mb-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${dayData.habits.length > 0 ? (dayData.habits.filter((h: Habit) => h.completed).length / dayData.habits.length) * 100 : 0}%` }}
            />
          </div>

          <div className="space-y-2">
            {dayData.habits.map((habit: Habit) => (
              <div
                key={habit.id}
                onClick={() => setDayData({
                  habits: dayData.habits.map((h: Habit) =>
                    h.id === habit.id ? { ...h, completed: !h.completed } : h
                  )
                })}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                  habit.completed
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  habit.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-600'
                }`}>
                  {habit.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className={`flex-1 text-sm ${habit.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                  {habit.name}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setDayData({
              habits: [...dayData.habits, {
                id: `h${Date.now()}`,
                name: 'New habit',
                completed: false
              }]
            })}
            className="mt-3 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add habit
          </button>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="font-semibold text-sm">Journal</h2>
          </div>
          <textarea
            value={dayData.journal}
            onChange={(e) => setDayData({ journal: e.target.value })}
            placeholder="Write your thoughts for today..."
            rows={5}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none"
          />
        </section>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-full text-xs text-slate-400 flex items-center gap-2 shadow-xl">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
        Auto-saved locally
      </div>
    </div>
  )
}
