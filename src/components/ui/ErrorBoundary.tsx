import React from 'react';
import ErrorState from './ErrorState';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // In future we can wire this to telemetry
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error instanceof Error ? this.state.error.message : 'Unexpected error';
      return (
        <div style={{ padding: '1rem' }}>
          <ErrorState title="App error" detail={msg} />
        </div>
      );
    }
    return this.props.children;
  }
}