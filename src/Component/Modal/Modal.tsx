// Modal.tsx

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    inputPlaceholder?: string;
    inputValue: string;
    setInputValue: (value: string) => void;
}

export function Modal({ isOpen, onClose, onConfirm, title, inputPlaceholder, inputValue, setInputValue }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={inputPlaceholder}
                    className="input input-bordered w-full mb-4"
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={onConfirm} className="btn btn-primary">Add</button>
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    );
}
