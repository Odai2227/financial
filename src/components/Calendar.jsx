import { DAYS, MONTHS, monthAt, nf } from '../lib/finance'

const dayStyle = {
  p: 'bg-pay-soft text-pay font-semibold',
  s: 'bg-inc-soft text-inc font-semibold',
  ps: 'bg-both-soft text-ink font-semibold',
}

function Month({ i, today, events, rows }) {
  const { y, m, dim } = monthAt(today, i)
  const first = new Date(y, m, 1).getDay()
  const mine = events.filter((e) => e.i === i)
  const row = rows[i]

  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-semibold">
          {MONTHS[m]} {y}
        </h3>
        <span className="text-xs text-mute">
          <span className="num text-pay">{nf(row.p)}</span> / <span className="num text-inc">{nf(row.n)}</span>
        </span>
      </div>
      <div className="grid grid-cols-7 gap-[3px] text-center">
        {DAYS.map((d) => (
          <b key={d} className="text-[11px] font-medium text-mute">
            {d}
          </b>
        ))}
        {Array.from({ length: first }, (_, k) => (
          <span key={`e${k}`} />
        ))}
        {Array.from({ length: dim }, (_, k) => {
          const d = k + 1
          const ds = mine.filter((e) => e.dt.getDate() === d)
          const p = ds.some((e) => e.k === 'p')
          const s = ds.some((e) => e.k === 's')
          const date = new Date(y, m, d)
          const isToday = +date === +today
          const tip = ds.map((e) => `${e.n}: ${nf(e.a)}`).join('\n')

          return (
            <div
              key={d}
              title={tip || undefined}
              aria-label={tip ? `${d}: ${tip.replace('\n', '، ')}` : undefined}
              className={[
                'flex aspect-square items-center justify-center rounded-lg text-sm',
                dayStyle[(p ? 'p' : '') + (s ? 's' : '')] || '',
                isToday ? 'outline-2 -outline-offset-2 outline-accent font-bold' : '',
                date < today ? 'opacity-45' : '',
              ].join(' ')}
            >
              {d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Calendar({ today, events, rows }) {
  const legend = [
    ['bg-pay-soft', 'يوم فيه دفعة'],
    ['bg-inc-soft', 'يوم نزول الراتب'],
    ['bg-both-soft', 'دفعة وراتب معاً'],
    ['border-2 border-accent', 'اليوم'],
  ]
  return (
    <section aria-labelledby="cal-h">
      <h2 id="cal-h" className="mb-2 mt-8 text-lg font-semibold">
        الرزنامة: 12 شهراً من اليوم
      </h2>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mute">
        {legend.map(([cls, label]) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`size-3 rounded-[4px] border border-line ${cls}`} />
            {label}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
        {Array.from({ length: 12 }, (_, i) => (
          <Month key={i} i={i} today={today} events={events} rows={rows} />
        ))}
      </div>
      <p className="mt-2 text-sm text-mute">
        الشهر الأول يُحتسب من تاريخ اليوم فصاعداً. مرّر المؤشر على اليوم الملوّن لرؤية التفاصيل.
      </p>
    </section>
  )
}
