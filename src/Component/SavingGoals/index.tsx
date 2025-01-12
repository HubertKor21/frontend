import React, { useState, useEffect } from "react";
import api from "../../api";
import GoalForm from "../GoalForm";
import { toast, ToastContainer } from "react-toastify"; // Import toastify

// Typy dla celów oszczędnościowych
interface SavingGoal {
  id: number;
  title: string;
  goal_type: string;
  current_amount: number;
  target_amount: number;
  progress: number;
  due_date: string;
}

// Opcje kategorii celu
export const goalTypeOptions = [
  { value: "", label: "Select goal type" },
  { value: "vacation", label: "Wakacje" },
  { value: "home_renovation", label: "Remont" },
  { value: "emergency_fund", label: "Fundusz awaryjny" },
  { value: "education", label: "Edukacja" },
  { value: "other", label: "Inne" },
];

const SavingGoals: React.FC = () => {
  const [goals, setGoals] = useState<SavingGoal[]>([]); // Lista celów
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Widoczność modalu
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null); // Wybrany cel
  const [modalAmount, setModalAmount] = useState<number>(0); // Kwota do dodania w modalu
  const [, setModalGoalType] = useState<string>(""); // Kategoria w modalu
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // Widoczność modalu potwierdzenia usunięcia

  // Pobieranie celów z API
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await api.get<SavingGoal[]>("api/savings-goals/");
        setGoals(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch goals. Please try again.");
        toast.error("Failed to fetch goals.");
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleAddAmount = async () => {
    if (selectedGoal && modalAmount > 0) {
      try {
        const response = await api.patch(`/api/savings-goals/${selectedGoal.id}/`, {
          current_amount: modalAmount,  // Tylko kwota do dodania
        });

        const updatedData = response.data;
        console.log("Response from API:", updatedData);

        setGoals((prevGoals) =>
          prevGoals.map((goal) =>
            goal.id === updatedData.id ? { ...goal, current_amount: updatedData.current_amount, goal_type: updatedData.goal_type } : goal
          )
        );

        setIsModalOpen(false); // Zamknij modal po zaktualizowaniu
        toast.success("Goal updated successfully!"); // Success toast
      } catch (err) {
        console.error("Failed to update goal:", err);
        setError("Failed to update goal. Please try again.");
        toast.error("Failed to update goal.");
      }
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await api.delete(`/api/savings-goals/${goalId}/`);
      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
      toast.success("Goal deleted successfully!"); // Success toast
    } catch (err) {
      console.error("Failed to delete goal:", err);
      setError("Failed to delete goal. Please try again.");
      toast.error("Failed to delete goal.");
    }
  };

  const handleConfirmDelete = () => {
    if (selectedGoal) {
      handleDeleteGoal(selectedGoal.id);
      setIsDeleteModalOpen(false); // Close delete modal after confirmation
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false); // Close delete modal on cancel
  };

  const handleAddGoal = (newGoal: SavingGoal) => {
    setGoals((prevGoals) => [...prevGoals, newGoal]);
    toast.success("Goal added successfully!"); // Success toast
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <h1 className="text-3xl font-bold text-center mb-6">Saving Goals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Goals</h2>
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white p-4 rounded shadow-md mb-4 border border-gray-200"
            >
              <h3 className="font-bold text-lg">{goal.title}</h3>
              <p>Type: {goal.goal_type}</p>
              <p>
                Progress: {goal.current_amount} / {goal.target_amount} ({goal.progress.toFixed(2)}%)
                <p>
                  <progress className="progress w-56" value={goal.progress.toFixed(2)} max="100"></progress>
                </p>
              </p>
              <p>Due Date: {goal.due_date}</p>
              <button
                onClick={() => {
                  setSelectedGoal(goal);
                  setModalAmount(0); // Zresetuj kwotę
                  setModalGoalType(goal.goal_type); // Ustaw kategorię na aktualną
                  setIsModalOpen(true);
                }}
                className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-600"
              >
                Update Goal
              </button>
              <button
                onClick={() => {
                  setSelectedGoal(goal);
                  setIsDeleteModalOpen(true); // Show delete confirmation modal
                }}
                className="bg-red-500 text-white py-2 px-4 rounded mt-4 ml-2 hover:bg-red-600"
              >
                Delete Goal
              </button>
            </div>
          ))}
        </div>
        <GoalForm onAddGoal={handleAddGoal}/>
      </div>

      {/* Modal */}
      {isModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/4">
            <h2 className="text-xl font-semibold mb-4">Update {selectedGoal.title}</h2>
            <div className="mb-4">
              <label className="block font-medium mb-2">Add Amount</label>
              <input
                type="number"
                value={modalAmount}
                onChange={(e) => setModalAmount(Number(e.target.value))}
                className="border p-2 w-full"
                placeholder="Enter amount to add"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleAddAmount}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete {selectedGoal.title}?</h2>
            <div className="flex justify-between">
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Confirm
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default SavingGoals;
