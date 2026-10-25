import { ACCOUNT, FREQ, defaultState } from '../lib/finance'

const field =
  'w-full min-w-24 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent'
const th = 'bg-head px-3 py-2 text-start font-semibold whitespace-nowrap'
const td = 'border-t border-line px-2 py-1.5'

function Input({ value, onChange, type = 'text', label }) {
  return (
    <input
      type={type}
      aria-label={label}
      value={value ?? ''}
      className={field}
      onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : +e.target.value) : e.target.value)}
    />
  )
}

function Select({ value, onChange, options, label }) {
  return (
    <select aria-label={label} value={value} className={field} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(options).map(([k, o]) => (
        <option key={k} value={k}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  )
}

function Block({ title, note, addLabel, onAdd, heads, children }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {heads.map((h, i) => (
                <th key={i} className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 rounded-lg border border-accent px-4 py-1.5 text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {addLabel}
      </button>
      {note && <p className="mt-2 text-sm text-mute">{note}</p>}
    </section>
  )
}

function Remove({ onClick }) {
  return (
    <button
      type="button"
      aria-label="حذف"
      onClick={onClick}
      className="rounded-md px-2 text-xl leading-none text-pay hover:bg-pay-soft focus-visible:outline-2 focus-visible:outline-accent"
    >
      ×
    </button>
  )
}

export default function DataEditor({ state, setState }) {
  const setList = (key, list) => setState({ ...state, [key]: list })
  const patch = (key, i, p) => setList(key, state[key].map((r, j) => (j === i ? { ...r, ...p } : r)))
  const remove = (key, i) => setList(key, state[key].filter((_, j) => j !== i))
  const add = (key, row) => setList(key, [...state[key], row])

  return (
    <div className="space-y-8">
      <p className="text-sm text-mute">
        كل ما تكتبه هنا يُحفظ في متصفحك تلقائياً ويحدّث الصفحة الأولى فوراً. الأرقام الظاهرة تجريبية، استبدلها ببياناتك.
      </p>

      <Block
        title="الدفعات والالتزامات"
        addLabel="إضافة دفعة"
        onAdd={() => add('pays', { n: '', v: '', d: '', c: 1, f: 'monthly' })}
        heads={['اسم الدفعة', 'القيمة', 'تاريخ الاستحقاق الأول', 'عدد التكرار', 'دورية الدفع', '']}
      >
        {state.pays.map((p, i) => (
          <tr key={i}>
            <td className={td}><Input label="اسم الدفعة" value={p.n} onChange={(v) => patch('pays', i, { n: v })} /></td>
            <td className={td}><Input label="القيمة" type="number" value={p.v} onChange={(v) => patch('pays', i, { v })} /></td>
            <td className={td}><Input label="تاريخ الاستحقاق" type="date" value={p.d} onChange={(v) => patch('pays', i, { d: v })} /></td>
            <td className={td}><Input label="عدد التكرار" type="number" value={p.c} onChange={(v) => patch('pays', i, { c: v })} /></td>
            <td className={td}><Select label="الدورية" options={FREQ} value={p.f} onChange={(v) => patch('pays', i, { f: v })} /></td>
            <td className={td}><Remove onClick={() => remove('pays', i)} /></td>
          </tr>
        ))}
      </Block>

      <div className="grid gap-6 lg:grid-cols-2">
        <Block
          title="الأرصدة الحالية"
          addLabel="إضافة حساب"
          onAdd={() => add('bals', { n: '', t: 'bank', v: '' })}
          note="مبلغ البطاقة الائتمانية هو المستحق عليك، بالموجب."
          heads={['الحساب', 'النوع', 'الرصيد', '']}
        >
          {state.bals.map((b, i) => (
            <tr key={i}>
              <td className={td}><Input label="الحساب" value={b.n} onChange={(v) => patch('bals', i, { n: v })} /></td>
              <td className={td}><Select label="النوع" options={ACCOUNT} value={b.t} onChange={(v) => patch('bals', i, { t: v })} /></td>
              <td className={td}><Input label="الرصيد" type="number" value={b.v} onChange={(v) => patch('bals', i, { v })} /></td>
              <td className={td}><Remove onClick={() => remove('bals', i)} /></td>
            </tr>
          ))}
        </Block>

        <Block
          title="الدخل (الراتب)"
          addLabel="إضافة تعديل للراتب"
          onAdd={() => add('sal', { from: '', amt: '', day: 27 })}
          note="عند زيادة الراتب أو نقصه أضف سطراً جديداً بتاريخ السريان ولا تعدّل القديم، فتبقى الأشهر السابقة كما هي."
          heads={['ساري من', 'الراتب', 'يوم النزول', '']}
        >
          {state.sal.map((r, i) => (
            <tr key={i}>
              <td className={td}><Input label="ساري من" type="date" value={r.from} onChange={(v) => patch('sal', i, { from: v })} /></td>
              <td className={td}><Input label="الراتب" type="number" value={r.amt} onChange={(v) => patch('sal', i, { amt: v })} /></td>
              <td className={td}><Input label="يوم النزول" type="number" value={r.day} onChange={(v) => patch('sal', i, { day: v })} /></td>
              <td className={td}><Remove onClick={() => remove('sal', i)} /></td>
            </tr>
          ))}
        </Block>
      </div>

      <button
        type="button"
        onClick={() => window.confirm('سيتم استبدال بياناتك بالبيانات التجريبية. هل تريد المتابعة؟') && setState(defaultState())}
        className="text-sm text-mute underline underline-offset-4 hover:text-ink"
      >
        استعادة البيانات التجريبية
      </button>
    </div>
  )
}
