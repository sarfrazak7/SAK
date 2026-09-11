import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Page error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center">
            <p className="mb-4 text-lg font-semibold">Something went wrong loading this page.</p>
            <a href="#/" className="rounded-lg bg-cyan-500/20 px-5 py-2.5 text-sm font-bold text-cyan-300 ring-1 ring-cyan-400/40 transition hover:bg-cyan-500/30">
              Back to Home
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
