import { Link } from 'react-router-dom'

export function SimplePage({ title }: { title: string }) {
  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center animate-slide-up">
        <span className="chip bg-brand-100 text-brand-700">Coming Soon</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 sm:text-4xl">{title}</h1>
        <p className="mt-4 text-ink-600 leading-relaxed">
          We're working hard to bring this to you. In the meantime, feel free to browse our products and place an order — our team is ready to help.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
          <Link to="/shop" className="btn-primary">Browse Products</Link>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
