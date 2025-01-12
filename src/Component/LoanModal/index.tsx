import { useState } from 'react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LoanFormData) => Promise<void>;
}

interface LoanFormData {
  id: number;
  name: string;
  amount_reaming: number;
  loan_type: "fixed" | "decreasing"; // Typ ustawiony na jeden z dozwolonych typów
  interest_rate: number;
  payment_day: number;
  last_payment_date: string;
  installments_remaining: number;
}

function LoanModal({ isOpen, onClose, onSubmit }: LoanModalProps) {
  const [formData, setFormData] = useState<LoanFormData>({
    id: 0,
    name: '',
    amount_reaming: 0, // Backend model field name
    loan_type: 'fixed', // Domyślnie ustawiamy na "fixed"
    interest_rate: 0,
    payment_day: 1,
    last_payment_date: '',
    installments_remaining: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'amount_reaming' ||
        name === 'interest_rate' ||
        name === 'payment_day' ||
        name === 'installments_remaining'
          ? parseFloat(value)
          : name === 'loan_type' // Zapewniamy, że 'loan_type' jest jednym z dozwolonych typów
          ? (value as "fixed" | "decreasing")
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // Submit form data as it is
    onClose(); // Close modal after submitting
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg md:w-[30%] p-6">
        <h2 className="text-xl font-bold mb-4 w-full">Add Loan</h2>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount remaining to be paid</label>
            <input
              type="number"
              name="amount_reaming"
              value={formData.amount_reaming}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Type of installments</label>
            <select
              name="loan_type"
              value={formData.loan_type}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="fixed">Constantly</option>
              <option value="decreasing">Decreasing</option>
            </select>
          </div>

          {/* Remaining form fields */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Interest (%)</label>
            <input
              type="number"
              name="interest_rate"
              value={formData.interest_rate}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              step="0.01"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Installment payment date</label>
            <input
              type="number"
              name="payment_day"
              value={formData.payment_day}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              min="1"
              max="31"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Last installment due date</label>
            <input
              type="date"
              name="last_payment_date"
              value={formData.last_payment_date}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Remaining installments</label>
            <input
              type="number"
              name="installments_remaining"
              value={formData.installments_remaining}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoanModal;
