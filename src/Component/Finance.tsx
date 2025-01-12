import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';  // Import toast from react-toastify

interface Account {
  id: number;
  bank_name: string;
  balance: number;
}

interface FinanceSummaryProps {
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const FinanceSummary: React.FC<FinanceSummaryProps> = ({ setShowForm }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);  // State for list of accounts
  const [newAccount, setNewAccount] = useState<Account>({ id: 0, bank_name: '', balance: 0 });
  const [editAccount, setEditAccount] = useState<Account | null>(null);  // State to track which account to edit
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // New state for delete confirmation modal
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [budgetResponse, bankResponse] = await Promise.all([  // Fetch data in parallel
          api.get('/api/budget/'),
          api.get('/api/banks/'),
        ]);
        setAccounts(bankResponse.data);  // Set accounts state with fetched bank data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchSummary();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.bank_name && newAccount.balance >= 0) {
      try {
        const response = await api.post('/api/banks/', {
          bank_name: newAccount.bank_name,
          balance: newAccount.balance,
        });
        setAccounts([...accounts, response.data]);  // Add new account to state
        setNewAccount({ id: 0, bank_name: '', balance: 0 });  // Reset the new account form
        setShowAddAccountModal(false);  // Close the modal after submitting
        toast.success('Your account has been successfully saved!');  // Show success toast
      } catch (error) {
        console.error('Error adding account:', error);
      }
    }
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editAccount && editAccount.bank_name && editAccount.balance >= 0) {
      try {
        const response = await api.put(`/api/banks/${editAccount.id}/`, {
          bank_name: editAccount.bank_name,
          balance: editAccount.balance,
        });
        const updatedAccounts = accounts.map(account =>
          account.id === editAccount.id ? response.data : account  // Update the edited account
        );
        setAccounts(updatedAccounts);  // Update the accounts state
        setEditAccount(null);  // Close edit form
        toast.success('Changes were saved successfully!');  // Show success toast
      } catch (error) {
        console.error('Error updating account:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editAccount) {
      setEditAccount({
        ...editAccount,
        [name]: name === 'balance' ? parseFloat(value) : value,
      });
    } else {
      setNewAccount({
        ...newAccount,
        [name]: name === 'balance' ? parseFloat(value) : value,
      });
    }
  };

  const handleEditClick = (account: Account) => {
    setEditAccount(account);  // Set the account to be edited
  };

  const handleClose = () => {
    setShowForm(false);
    setShowAddAccountModal(false);  // Close both modals
    setEditAccount(null);  // Close edit form
  };

  // Show the confirmation modal
  const handleDeleteRequest = (account: Account) => {
    setAccountToDelete(account);  // Set the account to delete
    setShowDeleteConfirmationModal(true);  // Show confirmation modal
  };

  // Confirm account deletion
  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      try {
        await api.delete(`/api/banks/${accountToDelete.id}/`);  // Call API to delete the account
        setAccounts(accounts.filter(account => account.id !== accountToDelete.id));  // Remove the deleted account from the state
        toast.success('Account has been deleted!');  // Show success toast
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account. Please try again.');  // Show error toast
      }
    }
    setShowDeleteConfirmationModal(false);  // Close confirmation modal
  };

  // Cancel the delete action
  const handleDeleteCancel = () => {
    setShowDeleteConfirmationModal(false);  // Close confirmation modal
    setAccountToDelete(null);  // Clear the account to delete
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white p-6 rounded-lg border text-black h-[70%] max-w-lg relative"  // Increased width and max-width
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          &#10005;
        </button>
        <h3 className="text-lg font-bold">Financial Summary</h3>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="p-4 bg-gray-100 rounded-lg shadow-md relative"
              onClick={() => handleEditClick(account)}  // Allow clicking on account to edit
            >
              <h4 className="font-bold text-xl">{account.bank_name}</h4>
              <p className="text-sm text-gray-600">Saldo: {account.balance} zł</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();  // Prevent modal opening when clicking delete
                  handleDeleteRequest(account);  // Request account deletion
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddAccountModal(true)}  // Show the modal when clicked
          className="absolute bottom-4 right-4 bg-gray-400 text-white px-5 rounded-full shadow-lg flex items-center justify-center"
        >
          <span className="text-2xl">+</span>
        </button>
      </div>

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddAccountModal(false)}  // Close the modal when clicking outside
        >
          <div
            className="bg-white p-6 rounded-lg border text-black w-[80%] max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddAccountModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              &#10005;
            </button>
            <h3 className="text-lg font-bold">Add Bank Account</h3>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <input
                type="text"
                name="bank_name"
                value={newAccount.bank_name}
                onChange={handleInputChange}
                placeholder="Nazwa konta"
                className="border rounded p-1 mb-2 w-full text-white"
                required
              />
              <input
                type="number"
                name="balance"
                value={newAccount.balance}
                onChange={handleInputChange}
                placeholder="Kwota"
                className="border rounded p-1 mb-2 w-full text-white"
                step="0.01"
                required
              />
              <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">
                Save Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleDeleteCancel}  // Close the modal when clicking outside
        >
          <div
            className="bg-white p-6 rounded-lg border text-black w-[80%] max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">Are you sure you want to delete your account?</h3>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, delete
              </button>
              <button
                onClick={handleDeleteCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editAccount && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleClose}  // Close the modal when clicking outside
        >
          <div
            className="bg-white p-6 rounded-lg border text-black w-[80%] max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              &#10005;
            </button>
            <h3 className="text-lg font-bold">Edit Bank Account</h3>

            <form onSubmit={handleEditFormSubmit} className="mt-4 space-y-4">
              <input
                type="text"
                name="bank_name"
                value={editAccount.bank_name}
                onChange={handleInputChange}
                placeholder="Nazwa konta"
                className="border rounded p-1 mb-2 w-full text-white"
                required
              />
              <input
                type="number"
                name="balance"
                value={editAccount.balance}
                onChange={handleInputChange}
                placeholder="Kwota"
                className="border rounded p-1 mb-2 w-full text-white"
                step="0.01"
                required
              />
              <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
              Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceSummary;
