import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

/** Last-resort safety net: if anything in the app crashes, show a message instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="grid min-h-screen place-items-center px-6 text-center">
          <div>
            <i className="fa-solid fa-circle-exclamation mb-3 text-2xl text-[#d69a7c]" aria-hidden="true" />
            <p className="text-sm text-[#e8e0d2]">Something went wrong in the museum.</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-md border border-white/15 px-3 py-2 text-xs hover:bg-white/5">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}