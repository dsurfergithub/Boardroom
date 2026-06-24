interface ConfirmModalProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmColor?: string;
  cancelText?: string;
}

export function ConfirmModal({ title, onConfirm, onCancel, confirmText = "Confirmar", confirmColor = "bg-[#0A84FF] hover:bg-[#007AFF] shadow-[#0A84FF33]", cancelText = "Cancelar" }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A]">
          <h2 className="text-lg font-bold text-white text-center">{title}</h2>
        </div>
        
        <div className="p-4 border-t border-[#38383A] flex justify-end gap-2 bg-[#1C1C1E]">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] rounded-xl text-sm font-semibold transition-colors flex-1"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-xl text-sm font-semibold shadow-lg transition-colors flex-1 ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
