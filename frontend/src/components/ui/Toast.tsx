// frontend/src/components/ui/Toast.tsx
import React from 'react';
import { toast, ToastOptions } from 'react-hot-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastConfig: ToastOptions = {
  duration: 5000,
  position: 'top-right',
  style: {
    background: '#fff',
    color: '#1f2937',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    maxWidth: '440px',
  },
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-green-100 ${
            t.visible ? 'animate-slide-up' : 'opacity-0'
          }`}
        >
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Sucesso</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { ...toastConfig, ...options }
    );
  },

  error: (message: string, options?: ToastOptions) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-red-100 ${
            t.visible ? 'animate-slide-up' : 'opacity-0'
          }`}
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Erro</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { ...toastConfig, ...options, duration: 6000 }
    );
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-yellow-100 ${
            t.visible ? 'animate-slide-up' : 'opacity-0'
          }`}
        >
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Atenção</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { ...toastConfig, ...options }
    );
  },

  info: (message: string, options?: ToastOptions) => {
    toast.custom(
      (t) => (
        <div
          className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-blue-100 ${
            t.visible ? 'animate-slide-up' : 'opacity-0'
          }`}
        >
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Info</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
      { ...toastConfig, ...options }
    );
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, { ...toastConfig, ...options });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};
