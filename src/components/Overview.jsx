import { useMemo } from 'react'
import { MONTHS, fmtDate, monthAt, nf, summarize } from '../lib/finance'
import BalanceChart from './BalanceChart'
import Calendar from './Calendar'

const th = 'bg-head px-3 py-2 text-start font-semibold whitespace-nowrap'
const td = 'border-t border-line px-3 py-1.5 whitespace-nowrap'

function Panel({ title, children }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">{children}</div>
    </section>
  )
}

function Stat({ label, value, hint, tone }) {
  return (
    <div className="px-4 py-3">
      <p className="text-sm text-mute">{label}</p>
      <p className={`text-2xl font-semibold ${tone || ''}`}>{value}</p>
      <p className="text-xs text-mute">{hint}</p>
    </div>
  )
}

export default function Overview({ state, today }) {
  const s = useMemo(() => summarize(state, today), [state, today])
  const after30 = s.net + s.inc30 - s.pay30
  const end = s.rows.at(-1).bal
  const next = s.payments[0]
  const ratio = s.incAll ? ((s.payAll / s.incAll) * 100).toFixed(1) + '%' : '-'
  const neg = (v) => (v < 0 ? 'text-pay' : '')

  return (
    <>
      {/* Hero: where the money is now and where it is heading */}
      <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-mute">الرصيد الصافي الحالي</p>
            <p className={`num text-5xl font-bold tracking-tight sm:text-6xl ${neg(s.net)}`}>{nf(s.net)}</p>
            <p className="mt-1 text-sm text-mute">الحسابات البنكية − مستحق البطاقات</p>
          </div>
          <div className="text-end">
            <p className="text-sm text-mute">بعد 12 شهراً</p>
            <p className={`num text-2xl font-semibold ${end >= s.net ? 'text-inc' : 'text-pay'}`}>{nf(end)}</p>
            <p className="text-xs text-mute">يفترض ثبات الدخل والالتزامات</p>
          </div>
        </div>
        <div className="mt-5">
          <BalanceChart start={s.net} rows={s.rows} today={today} />
        </div>
      </section>

      <section
        aria-label="مؤشرات رئيسية"
        className="mt-4 grid grid-cols-2 divide-line overflow-hidden rounded-2xl border border-line bg-surface sm:grid-cols-3 lg:grid-cols-6 [&>*]:border-line [&>*]:not-first:border-s max-lg:[&>*]:border-b"
      >
        <Stat label="دفعات 30 يوماً" value={<span className="num">{nf(s.pay30)}</span>} hint={`عددها ${s.count30}`} tone="text-pay" />
        <Stat
          label="دخل 30 يوماً"
          value={<span className="num">{nf(s.inc30)}</span>}
          hint={s.nextSalary ? `الراتب القادم ${fmtDate(s.nextSalary.dt)}` : 'لا يوجد راتب مسجّل'}
          tone="text-inc"
        />
        <Stat label="الرصيد بعد 30 يوماً" value={<span className="num">{nf(after30)}</span>} hint="الرصيد + الدخل − الدفعات" tone={neg(after30)} />
        <Stat label="دفعات 12 شهراً" value={<span className="num">{nf(s.payAll)}</span>} hint="من الجدول الشهري" />
        <Stat label="دخل 12 شهراً" value={<span className="num">{nf(s.incAll)}</span>} hint="حسب سجل الراتب" />
        <Stat label="الدفعات من الدخل" value={<span className="num">{ratio}</span>} hint="إجمالي الدفعات ÷ إجمالي الدخل" />
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Panel title="الملخص الشهري: الدفعات مقابل الدخل">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['الشهر', 'الدفعات', 'الدخل', 'الصافي', 'النسبة', 'الرصيد المتوقع'].map((h) => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => {
                const { y, m } = monthAt(today, r.i)
                const diff = r.n - r.p
                return (
                  <tr key={r.i}>
                    <td className={td}>{MONTHS[m]} {y}</td>
                    <td className={`${td} text-pay`}><span className="num">{nf(r.p)}</span></td>
                    <td className={`${td} text-inc`}><span className="num">{nf(r.n)}</span></td>
                    <td className={`${td} ${neg(diff)}`}><span className="num">{nf(diff)}</span></td>
                    <td className={td}><span className="num">{r.n ? Math.round((r.p / r.n) * 100) + '%' : '-'}</span></td>
                    <td className={`${td} font-semibold ${neg(r.bal)}`}><span className="num">{nf(r.bal)}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title="أقرب 10 دفعات قادمة">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['الدفعة', 'التاريخ', 'القيمة', 'بعد (يوم)'].map((h) => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.payments.slice(0, 10).map((e, k) => (
                <tr key={k}>
                  <td className={td}>{e.n}</td>
                  <td className={td}><span className="num">{fmtDate(e.dt)}</span></td>
                  <td className={`${td} text-pay`}><span className="num">{nf(e.a)}</span></td>
                  <td className={td}><span className="num">{Math.round((e.dt - today) / 864e5)}</span></td>
                </tr>
              ))}
              {!next && (
                <tr>
                  <td className={td} colSpan={4}>لا توجد دفعات قادمة. أضفها من صفحة البيانات.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>

      <Calendar today={today} events={s.events} rows={s.rows} />
    </>
  )
}
