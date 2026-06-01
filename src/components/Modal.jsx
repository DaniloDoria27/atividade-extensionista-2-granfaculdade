import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export default function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Sim',
  cancelText = 'Não',
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 animate-fade-in'>
      <div className='w-full max-w-md rounded-lg bg-brand-surface p-6 shadow-xl border border-brand-border'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600'>
            <AlertTriangle size={20} />
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-brand-main'>{title}</h3>
            <p className='mt-2 text-sm text-brand-muted whitespace-pre-line'>
              {message}
            </p>
          </div>
        </div>

        <div className='mt-6 flex justify-end gap-3'>
          <button
            type='button'
            className='px-4 py-2 rounded-md border border-brand-border text-sm font-medium text-brand-muted hover:bg-gray-100 transition-colors'
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type='button'
            className='px-4 py-2 rounded-md text-sm font-medium btn-danger transition-colors'
            style={{
              backgroundColor:
                title.includes('sucesso') || title.includes('Aviso')
                  ? 'var(--primary)'
                  : 'var(--danger)',
            }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body // <--- Injeta o HTML na raiz do sistema mantendo o funcionamento do React intacto
  );
}
