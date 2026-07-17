import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="container-x py-20 text-center sm:py-32">
      <div className="font-display text-7xl font-extrabold text-brand-600 sm:text-9xl animate-slide-up">404</div>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-2 text-ink-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 inline-block btn-primary">Back to Home</Link>
    </div>
  )
}
