import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import api from "../../api";

interface CalculatorData {
  id: number;
  expense_category: string;
  monthly_spending: number;
  user_savings_percent: number;
  suggested_savings: number;
  potential_savings: number;
}

interface FormData {
  expense_category: string;
  monthly_spending: string;
  user_savings_percent: string;
}

function Calculator() {
  const [calculators, setCalculators] = useState<CalculatorData[]>([]);
  const [formData, setFormData] = useState<FormData>({
    expense_category: "",
    monthly_spending: "",
    user_savings_percent: "20", // Domyślny procent
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchCalculators = async () => {
      try {
        // Dopasowanie odpowiedzi z API
        const response = await api.get<Partial<CalculatorData>[]>("/api/savings-calculators/");
        
        // Dodajemy brakujące dane, jeżeli są dostępne
        const fullCalculators: CalculatorData[] = response.data.map(calc => ({
          id: calc.id || 0, // Jeżeli brak id, ustawiamy na 0
          expense_category: calc.expense_category || "",
          monthly_spending: calc.monthly_spending || 0,
          user_savings_percent: calc.user_savings_percent || 0,
          suggested_savings: calc.suggested_savings || 0,
          potential_savings: calc.potential_savings || 0,
        }));

        setCalculators(fullCalculators);

        const uniqueCategories = [
          ...new Set(fullCalculators.map((calc) => calc.expense_category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchCalculators();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post("/api/savings-calculators/", {
        ...formData,
        monthly_spending: parseFloat(formData.monthly_spending),
        user_savings_percent: parseFloat(formData.user_savings_percent),
      });
      setCalculators([...calculators, response.data]);
      if (!categories.includes(response.data.expense_category)) {
        setCategories([...categories, response.data.expense_category]);
      }
      setFormData({ expense_category: "", monthly_spending: "", user_savings_percent: "20" });
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const filteredCalculators =
    selectedCategory === ""
      ? calculators
      : calculators.filter(
          (calc) => calc.expense_category === selectedCategory
        );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Savings Calculator</h1>
      <div className="mb-6">
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category:
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="select select-bordered w-full"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-y-auto max-h-80 border border-gray-200 rounded-lg shadow-md p-4 bg-white">
        <ul className="space-y-4">
          {filteredCalculators.map((calculator) => (
            <li key={calculator.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
              <p>
                <strong>Category:</strong> {calculator.expense_category}
              </p>
              <p>
                <strong>Monthly Spending:</strong> ${calculator.monthly_spending}
              </p>
              <p>
                <strong>Savings Percentage:</strong> {calculator.user_savings_percent}%
              </p>
              <p>
                <strong>Suggested Savings:</strong> ${calculator.suggested_savings}
              </p>
              <p>
                <strong>Potential Annual Savings:</strong> ${calculator.potential_savings}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 border border-gray-200 rounded-lg shadow-md space-y-4 mt-6">
        <div>
          <label htmlFor="expense_category" className="block text-sm font-medium text-gray-700">
            Expense Category:
          </label>
          <input
            type="text"
            id="expense_category"
            name="expense_category"
            value={formData.expense_category}
            onChange={handleInputChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label htmlFor="monthly_spending" className="block text-sm font-medium text-gray-700">
            Monthly Spending:
          </label>
          <input
            type="number"
            id="monthly_spending"
            name="monthly_spending"
            value={formData.monthly_spending}
            onChange={handleInputChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label htmlFor="user_savings_percent" className="block text-sm font-medium text-gray-700">
            Savings Percentage:
          </label>
          <input
            type="number"
            id="user_savings_percent"
            name="user_savings_percent"
            value={formData.user_savings_percent}
            onChange={handleInputChange}
            required
            min="0"
            max="100"
            className="input input-bordered w-full"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Add Calculator
        </button>
      </form>
    </div>
  );
}

export default Calculator;
