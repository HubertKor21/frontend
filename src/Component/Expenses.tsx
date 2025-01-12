import React, { useState, useEffect } from 'react';
import DataTable from "react-data-table-component";
import api from '../api'; // Ensure the path is correct
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



interface Category {
  id: number;
  category_author: number;
  category_title: string;
  category_note: string;
  assigned_amount: number;
  created_at: string;
  bank: number; // ID of the selected bank
}

interface Group {
  id: number;
  groups_title: string;
  groups_author: number;
  created_at: string;
  categories: Category[];
  family: {
    name: string;
    members: number[];
  };
}

interface Bank {
  id: number;
  bank_name: string;
}

const ExpensesSection: React.FC<{ group: Group , category: Category}> = ({ group, category }) => {
  const [banks, setBanks] = useState<Bank[]>([]); // List of available banks
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [, setIsLoadingBanks] = useState(true);
  const [modalData, setModalData] = useState<{ category_name: string; amount: string; note: string; bankId: number }>({
    category_name: '', amount: '', note: '', bankId: 0
  });
  const [updatedCategories, setUpdatedCategories] = useState<Category[]>(group.categories); // State for updated categories
  const [editCategory, setEditCategory] = useState<Category | null>(null); // State for the category being edited
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // Fetch available banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        console.log("Fetching banks...");
        const response = await api.get('/api/banks/name/');
        setBanks(response.data); // Set the list of banks
        console.log("Banks fetched:", response.data);
      } catch (error) {
        console.error('Error loading banks:', error);
      } finally {
        setIsLoadingBanks(false);
        console.log("Finished loading banks.");
      }
    };

    fetchBanks();
  }, [group.id]);

  // Function for adding a category
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    const amount = parseFloat(modalData.amount.trim()) || 0;
    if (amount > 0 && modalData.bankId > 0 && modalData.category_name.trim() !== '') {
      const newCategory = {
        category_author: 0, // Set appropriate author ID
        category_title: modalData.category_name,
        category_note: modalData.note,
        assigned_amount: amount,
        created_at: new Date().toISOString(),
        bank: modalData.bankId,
      };

      try {
        const response = await api.post(`/api/groups/${group.id}/add-categories/`, newCategory);
        const categoryWithId = { ...response.data, id: response.data.id };
        setUpdatedCategories(prevCategories => [...prevCategories, categoryWithId]); // Update categories after adding
        setModalData({ category_name: '', amount: '', note: '', bankId: 0 }); // Reset modal data
        document.getElementById(`expense_modal_${group.id}`)?.close();
        toast.success("Category added successfully")
      } catch (error) {
        toast.error("Faild to add category");
      }
    } else {
      if (modalData.category_name.trim() == "") {
        toast.error("Category name is required.");
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        toast.error("Amount must be a valid number greater than 0.");
        return;
      }
      if (modalData.bankId <= 0) {
        toast.error("A valid bank must be selected.");
        return;
      }
    }
  };

  // Function for handling the "Edit" button click
  const handleEditCategory = (category: Category) => {
    setEditCategory(category); // Set the category to be edited
    setModalData({
      category_name: category.category_title,
      amount: category.assigned_amount.toString(),
      note: category.category_note,
      bankId: category.bank,
    });
    document.getElementById(`edit_expense_modal_${group.id}`)?.showModal();
  };

  // Function for submitting the edited category
  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(modalData.amount.trim()) || 0;
    if (amount > 0 && modalData.bankId > 0 && modalData.category_name.trim() !== '') {
      const updatedCategory = {
        ...editCategory,
        category_title: modalData.category_name,
        category_note: modalData.note,
        assigned_amount: amount,
        bank: modalData.bankId,
      };

      try {
        const response = await api.put(`/api/groups/${group.id}/categories/${editCategory.id}/`, updatedCategory);
        setUpdatedCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.id === editCategory.id ? { ...category, ...response.data } : category
          )
        );
        setModalData({ category_name: '', amount: '', note: '', bankId: 0 });
        document.getElementById(`edit_expense_modal_${group.id}`)?.close();
        toast.success("Category updated successfully!")
      } catch (error) {
        toast.error('Error updating category:');
      }
    } else {
      toast.error('Amount must be greater than 0 and a bank must be selected.');
    }
  };
  const deleteCategory = async (categoryId: number) => {
    try {
      await api.delete(`/api/groups/${group.id}/categories/${categoryId}/`);
      setUpdatedCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
      toast.success("Category deleted successfully.");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    } finally {
      setIsDeleteCategoryModalOpen(false); // Zamknij modal po zakończeniu
    }
  };
  
  const openDeleteCategoryModal = (categoryId: number) => {
    setCategoryToDelete(categoryId); // Ustaw ID kategorii do usunięcia
    setIsDeleteCategoryModalOpen(true); // Otwórz modal
  };
  
  

  const deleteGroup = async () => {
    {
      try {
        await api.delete(`/api/groups/${group.id}/`);
        toast.success("Group delete successfully!")
        setIsDeleteModalOpen(false); // Close the modal after deletion
        // Optionally, trigger a parent component update or navigation after deletion
      } catch (error) {
        toast.error("Error deleting group:");
        alert("Failed to delete group. Please try again.");
      }
    }
  };

  // Columns for DataTable
  const columns = [
    {
      name: "Category Name",
      selector: (row: any) => row.category_title,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row: any) => row.assigned_amount,
      sortable: true,
    },
    {
      name: "Note",
      selector: (row: any) => row.category_note,
      sortable: true,
    },
    {
      name: "Bank",
      selector: (row: any) => {
        const bank = banks.find(b => b.id === row.bank);
        return bank ? bank.bank_name : 'No bank';
      },
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <div>
        <button onClick={() => handleEditCategory(row)} className="btn btn-warning mr-2">Edit</button>
        <button onClick={() => openDeleteCategoryModal(row.id)} className="btn btn-danger">Delete</button>
      </div>
      ),
    }
  ];

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">{group.groups_title}</h4>
        <button
          onClick={() => setIsDeleteModalOpen(true)} // Open the delete modal
          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded"
          aria-label="Delete group"
        >
          ✕
        </button>
      </div>
      {/* Table for categories */}
      <DataTable
        columns={columns}
        data={updatedCategories} // Use the updated category state
      />

      {/* Modal for adding a category */}
      <button
        onClick={() => {
          document.getElementById(`expense_modal_${group.id}`).showModal();
        }}
        className="mt-4 text-blue-400"
      >
        Add Category
      </button>

      <dialog id={`expense_modal_${group.id}`} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add Category</h3>
          <label className="block text-sm mt-2">Category Name</label>
          <input
            type="text"
            value={modalData.category_name}
            onChange={(e) => setModalData(prev => ({ ...prev, category_name: e.target.value }))}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter category name"
          />
          <label className="block text-sm mt-2">Amount:</label>
          <input
            type="text"
            value={modalData.amount}
            onChange={(e) => setModalData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter amount"
          />
          <label className="block text-sm mt-2">Note:</label>
          <input
            type="text"
            value={modalData.note}
            onChange={(e) => setModalData(prev => ({ ...prev, note: e.target.value }))}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <label className="block text-sm">Select Bank:</label>
          <select
              value={modalData.bankId}
              onChange={(e) => setModalData(prev => ({ ...prev, bankId: parseInt(e.target.value) }))}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="" disabled selected={!modalData.bankId}>Select bank</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.id}>{bank.bank_name}</option>
              ))}
            </select>

          <button onClick={addCategory} className="btn btn-primary mt-4">Add Category</button>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => {
              document.getElementById(`expense_modal_${group.id}`).close();
            }} className="mt-2 text-white">Close</button>
          </form>
        </div>
      </dialog>

      {/* Modal for editing a category */}
      {editCategory && (
        <dialog id={`edit_expense_modal_${group.id}`} className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Category</h3>
            <label className="block text-sm mt-2">Category Name</label>
            <input
              type="text"
              value={modalData.category_name}
              onChange={(e) => setModalData(prev => ({ ...prev, category_name: e.target.value }))}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="Enter category name"
            />
            <label className="block text-sm mt-2">Amount:</label>
            <input
              type="text"
              value={modalData.amount}
              onChange={(e) => setModalData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="Enter amount"
            />
            <label className="block text-sm mt-2">Note:</label>
            <input
              type="text"
              value={modalData.note}
              onChange={(e) => setModalData(prev => ({ ...prev, note: e.target.value }))}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <label className="block text-sm">Select Bank:</label>
            <select
              value={modalData.bankId}
              onChange={(e) => setModalData(prev => ({ ...prev, bankId: parseInt(e.target.value) }))}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="" disabled selected={!modalData.bankId}>Select bank</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.id}>{bank.bank_name}</option>
              ))}
            </select>

            <button onClick={handleEditFormSubmit} className="btn btn-primary mt-4">Save Changes</button>
            <form method="dialog" className="modal-backdrop">
              <button type="button" onClick={() => {
                document.getElementById(`edit_expense_modal_${group.id}`).close();
              }} className="mt-2 text-white">Close</button>
            </form>
          </div>
        </dialog>
      )}
      {isDeleteModalOpen && (
        <dialog className="modal" open>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p>Are you sure you want to delete the group <strong>{group.groups_title}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={deleteGroup}
                className="btn btn-danger mr-2"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)} // Close the modal
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
      {isDeleteCategoryModalOpen && (
        <dialog className="modal" open>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p>Are you sure you want to delete this category? This action cannot be undone.</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => categoryToDelete !== null && deleteCategory(categoryToDelete)}
                className="btn btn-danger mr-2"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteCategoryModalOpen(false)} // Zamknij modal
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}

    </div>
  );
};

export default ExpensesSection;
