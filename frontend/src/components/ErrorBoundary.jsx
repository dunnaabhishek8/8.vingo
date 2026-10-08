import React from "react"

// Catches unexpected render crashes and shows a friendly recovery screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error("[ErrorBoundary]", error)
  }

  handleReload = () => window.location.reload()

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
          <span className="text-5xl mb-4">🍽️</span>
          <h1 className="text-xl font-extrabold text-ink-900">Something went wrong</h1>
          <p className="text-sm text-ink-500 mt-2 max-w-sm">
            An unexpected error occurred. Reloading usually fixes it.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-6 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 transition"
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary