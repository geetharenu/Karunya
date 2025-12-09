import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear local storage to fix corrupted data
    localStorage.clear();
    // Reload the page to restart the app with defaults
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="text-5xl mb-6">🤕</div>
            <h1 className="text-2xl font-bold mb-4 text-red-400">Oops! Something went wrong.</h1>
            <p className="text-gray-400 mb-6 text-sm">
              The application encountered an error. This usually happens if the saved data structure has changed.
            </p>
            
            <div className="bg-black/30 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32">
                <code className="text-xs text-red-300 font-mono">
                    {this.state.error?.message || "Unknown Error"}
                </code>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fas fa-trash-restore"></i>
              Reset App & Restore Defaults
            </button>
            <p className="text-xs text-gray-500 mt-4">
              This will clear local storage and reload the permanent build.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}