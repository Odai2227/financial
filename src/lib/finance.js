export const FREQ = {
  monthly: { label: 'شهري', step: 1 },
  quarterly: { label: 'ربع سنوي', step: 3 },
  semiannual: { label: 'نصف سنوي', step: 6 },
  annual: { label: 'سنوي', step: 12 },
  once: { label: 'لمرة واحدة', step: 1 },
}

export const ACCOUNT = { bank: 'حساب بنكي', card: 'بطاقة ائتمانية' }

export const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
export const DAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

export const nf = (x) => Math.round(+x || 0).toLocaleString('en-US')

export const parseDate = (s) => {
  const [a, b, c] = s.split('-').map(Number)
  return new Date(a, b - 1, c)
}

export const fmtDate = (d) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

export const startOfToday = () => {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

export const defaultState = () => ({
  pays: [
    { n: 'قسط سيارة', v: 1600, d: '2026-11-01', c: 26, f: 'monthly' },
    { n: 'تأمين سنوي', v: 800, d: '2026-12-05', c: 5, f: 'annual' },
  ],
  bals: [
    { n: 'حساب بنكي 1', t: 'bank', v: 12500 },
    { n: 'حساب بنكي 2', t: 'bank', v: 4300 },
    { n: 'بطاقة ائتمانية 1', t: 'card', v: 1850 },
  ],
  sal: [{ from: '2026-01-01', amt: 9000, day: 27 }],
})

export const isValidState = (s) =>
  s && Array.isArray(s.pays) && Array.isArray(s.bals) && Array.isArray(s.sal)

/** Year / month / days-in-month for the i-th month counted from today's month. */
export const monthAt = (T0, i) => {
  const y = T0.getFullYear() + Math.floor((T0.getMonth() + i) / 12)
  const m = (T0.getMonth() + i) % 12
  return { y, m, dim: new Date(y, m + 1, 0).getDate() }
}

/** Every payment / salary occurrence over the next 12 calendar months. */
export function buildEvents(S, T0) {
  const out = []
  for (let i = 0; i < 12; i++) {
    const { y, m, dim } = monthAt(T0, i)

    S.pays.forEach((p) => {
      if (!p.d || !+p.v) return
      const first = parseDate(p.d)
      const step = FREQ[p.f]?.step || 1
      const count = p.f === 'once' ? 1 : +p.c || 0
      const k = (y - first.getFullYear()) * 12 + m - first.getMonth()
      if (k >= 0 && k % step === 0 && k / step < count) {
        out.push({
          dt: new Date(y, m, Math.min(first.getDate(), dim)),
          n: p.n || 'دفعة',
          a: +p.v,
          k: 'p',
          i,
        })
      }
    })

    // latest salary entry effective by the end of this month
    const end = new Date(y, m + 1, 0)
    let r = null
    S.sal.forEach((x) => {
      if (x.from && parseDate(x.from) <= end && (!r || x.from > r.from)) r = x
    })
    if (r) {
      out.push({
        dt: new Date(y, m, Math.min(+r.day || 1, dim)),
        n: 'الراتب',
        a: +r.amt || 0,
        k: 's',
        i,
      })
    }
  }
  return out
}

export function summarize(S, T0) {
  const events = buildEvents(S, T0)
  const upcoming = events.filter((e) => e.dt >= T0)
  const total = (list, k) => list.filter((e) => e.k === k).reduce((t, e) => t + e.a, 0)

  const bank = S.bals.filter((b) => b.t === 'bank').reduce((t, b) => t + (+b.v || 0), 0)
  const card = S.bals.filter((b) => b.t === 'card').reduce((t, b) => t + (+b.v || 0), 0)
  const net = bank - card

  const l30 = new Date(T0)
  l30.setDate(l30.getDate() + 30)
  const next30 = upcoming.filter((e) => e.dt <= l30)

  let bal = net
  const rows = Array.from({ length: 12 }, (_, i) => {
    const mo = upcoming.filter((e) => e.i === i)
    const p = total(mo, 'p')
    const n = total(mo, 's')
    bal += n - p
    return { i, p, n, bal }
  })

  const payments = upcoming.filter((e) => e.k === 'p').sort((a, b) => a.dt - b.dt)
  const nextSalary = upcoming.filter((e) => e.k === 's').sort((a, b) => a.dt - b.dt)[0]

  return {
    events,
    net,
    rows,
    payments,
    nextSalary,
    pay30: total(next30, 'p'),
    inc30: total(next30, 's'),
    count30: next30.filter((e) => e.k === 'p').length,
    payAll: total(upcoming, 'p'),
    incAll: total(upcoming, 's'),
  }
}
