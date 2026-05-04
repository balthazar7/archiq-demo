const YELLOW = '#f9ae12'

export function ProContactCard() {
  return (
    <div
      className="rounded-2xl p-5 border-2 text-center"
      style={{ backgroundColor: YELLOW + '18', borderColor: YELLOW + '80' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: YELLOW }}>
        Professionnel ?
      </p>
      <p className="text-stone-800 font-semibold text-base mb-3 leading-snug">
        Contactez archiQ pour connaître les modalités d'achat
      </p>
      <span
        className="inline-block px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md select-all"
        style={{ backgroundColor: YELLOW }}
      >
        contact@archiq.fr
      </span>
    </div>
  )
}
