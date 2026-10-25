import { useMemo, useState } from 'react'
import { defaultState, fmtDate, isValidState, startOfToday } from './lib/finance'
import { useStoredState } from './hooks/useStoredState'
import Overview from './components/Overview'
import DataEditor from './components/DataEditor'

const TABS = [
  { id: 'overview', label: 'الملخص والرزنامة' },
  { id: 'data', label: 'البيانات المالية' },
]

export default function App() {
  const [state, setState] = useStoredState('fin-planner-v2', defaultState, isValidState)
  const [tab, setTab] = useState('overview')
  const today = useMemo(startOfToday, [])

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">مخطط الشؤون المالية الشخصية</h1>
            <p className="text-sm text-mute">
              اليوم <span className="num">{fmtDate(today)}</span>، والرزنامة تغطي 12 شهراً قادمة
            </p>
          </div>

          <div role="tablist" aria-label="الصفحات" className="flex rounded-xl bg-head p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={[
                  'rounded-lg px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  tab === t.id ? 'bg-surface font-semibold text-ink shadow-sm' : 'text-mute hover:text-ink',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 pb-12 pt-5">
        <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={tab !== 'overview'}>
          {tab === 'overview' && <Overview state={state} today={today} />}
        </div>
        <div role="tabpanel" id="panel-data" aria-labelledby="tab-data" hidden={tab !== 'data'}>
          {tab === 'data' && <DataEditor state={state} setState={setState} />}
        </div>
      </main>
    </div>
  )
}
