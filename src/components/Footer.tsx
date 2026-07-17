import { Link } from 'react-router-dom'

const COLS = [
  { title: 'Shop', links: [['All Products', '/shop'], ['Electronics', '/category/electronics'], ['Fashion', '/category/fashion'], ['Hot Deals', '/deals'], ['New Arrivals', '/shop?sort=newest']] },
  { title: 'Help', links: [['Track Order', '/track'], ['Shipping Info', '/help'], ['Returns', '/help'], ['FAQs', '/help'], ['Contact Us', '/help']] },
  { title: 'Company', links: [['About Us', '/about'], ['Careers', '/about'], ['Sell on shopducts', '/about'], ['Privacy Policy', '/about'], ['Terms', '/about']] },
]

export function Footer() {
  return (
    <footer className="mt-16 bg-[#002A66] text-ink-300">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white font-display font-bold text-lg">S</span>
              <span className="font-display text-xl font-bold text-white">shopducts<span className="text-brand-400">.pk</span></span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-ink-400 leading-relaxed">
              Pakistan's growing marketplace for electronics, fashion, home essentials and more.
              Cash on delivery, fast nationwide shipping, and 7-day easy returns.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Cash on Delivery', 'Easy Returns', 'Nationwide Shipping'].map(b => (
                <span key={b} className="chip bg-ink-900 text-ink-300 text-xs">{b}</span>
              ))}
            </div>
          </div>

          {COLS.map(col => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-ink-400 hover:text-white transition">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-ink-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} shopducts.pk — Made in Pakistan</p>
          <div className="flex items-center gap-3">
            {['facebook', 'instagram', 'twitter', 'youtube'].map(s => (
              <a key={s} href="#" aria-label={s} className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 hover:bg-brand-600 transition">
                <span className="text-xs font-bold uppercase">{s[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
