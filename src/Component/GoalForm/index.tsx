import React, { useState } from "react";
import api from "../../api";
import { goalTypeOptions } from "../SavingGoals";

interface FormData {
  id: number;
  title: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  due_date: string;
  progress: number; // Add progress to FormData
}

interface GoalFormProps {
  onAddGoal: (goal: FormData) => void; // Typujemy goal zgodnie z FormData
}

interface FormErrors {
  title?: string;
  goal_type?: string;
  target_amount?: string;
  current_amount?: string;
  due_date?: string;
}

const GoalForm: React.FC<GoalFormProps> = ({ onAddGoal }) => {
  const [formData, setFormData] = useState<FormData>({
    id: 0,
    title: "",
    goal_type: "",
    target_amount: 0,
    current_amount: 0,
    due_date: "",
    progress: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "target_amount" || name === "current_amount" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prosta walidacja
    if (!formData.title.trim()) {
      setErrors((prev) => ({ ...prev, title: "Title is required." }));
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Form Data before API call:", formData); // Debugowanie przed wysłaniem danych
      const response = await api.post<FormData>("api/savings-goals/", formData);
      console.log("Response from API:", response.data); // Debugowanie odpowiedzi z API
      
      // Wywołanie onAddGoal z odpowiedzią z API
      onAddGoal(response.data);

      // Resetowanie formularza
      setFormData({
        id: 0,
        title: "",
        goal_type: "",
        target_amount: 0,
        current_amount: 0,
        due_date: "",
        progress: 0,
      });
    } catch (err: any) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        console.error("Error adding goal:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      id: 0,
      title: "",
      goal_type: "",
      target_amount: 0,
      current_amount: 0,
      due_date: "",
      progress: 0,
    });
    setErrors({});
  };

  return (
    <div className="bg-white p-6 rounded shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Add New Goal</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Goal Type</label>
          <select
            name="goal_type"
            value={formData.goal_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          >
            {goalTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.goal_type && <p className="text-red-500 text-sm">{errors.goal_type}</p>}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Target Amount</label>
          <input
            type="number"
            name="target_amount"
            value={formData.target_amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.target_amount && <p className="text-red-500 text-sm">{errors.target_amount}</p>}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Current Amount</label>
          <input
            type="number"
            name="current_amount"
            value={formData.current_amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.current_amount && <p className="text-red-500 text-sm">{errors.current_amount}</p>}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.due_date && <p className="text-red-500 text-sm">{errors.due_date}</p>}
        </div>

        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Goal"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="ml-4 px-4 py-2 rounded text-white bg-gray-500 hover:bg-gray-600"
        >
          Reset
        </button>
      </form>
    </div>
  );
};

export default GoalForm;
