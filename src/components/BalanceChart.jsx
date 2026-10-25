import { MONTHS, monthAt, nf } from '../lib/finance'

/** Projected balance: today's net balance followed by the end-of-month balance for 12 months. */
export default function BalanceChart({ start, rows, today }) {
  const W = 640
  const H = 190
  const padX = 12
  const padTop = 16
  const padBottom = 26

  const values = [start, ...rows.map((r) => r.bal)]
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const span = max - min || 1
  const x = (i) => padX + (i * (W - padX * 2)) / (values.length - 1)
  const y = (v) => padTop + (1 - (v - min) / span) * (H - padTop - padBottom)

  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(values.length - 1)} ${H - padBottom} L${x(0)} ${H - padBottom} Z`
  const lowest = values.indexOf(Math.min(...values))
  const labelAt = [0, 3, 6, 9, 12]
  const monthLabel = (i) => (i === 0 ? 'اليوم' : MONTHS[monthAt(today, i - 1).m])

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`الرصيد المتوقع خلال 12 شهراً، من ${nf(start)} إلى ${nf(values.at(-1))}`}
    >
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {min < 0 && (
        <line x1={padX} x2={W - padX} y1={y(0)} y2={y(0)} stroke="var(--pay)" strokeDasharray="4 4" strokeOpacity=".6" />
      )}
      <path d={area} fill="url(#fade)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === 0 || i === lowest || i === values.length - 1 ? 4.5 : 2.5} fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
      ))}

      <text x={x(lowest)} y={y(values[lowest]) + (lowest === 0 ? -10 : 18)} textAnchor="middle" fontSize="11" fill="var(--mute)">
        {lowest === 0 ? '' : `أدنى رصيد ${nf(values[lowest])}`}
      </text>

      {labelAt.map((i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--mute)">
          {monthLabel(i)}
        </text>
      ))}
    </svg>
  )
}
