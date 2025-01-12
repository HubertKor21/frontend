import { useEffect, useState } from "react";
import api from "../../api";
import userIcon from "../../assets/images/userIcon.png";
import salesIcon from "../../assets/images/salesIcon.png";
import ordersIcon from "../../assets/images/ordersIcon.png";
import revenueIcon from "../../assets/images/revenueIcon.png";
import { ToastContainer } from "react-toastify"; // Import toastify
import "react-toastify/dist/ReactToastify.css"; // Import stylów

// Interfejsy dla danych API
interface Account {
  id: number;
  bank_name: string;
  balance: number;
}

interface GroupBalance {
  total_expenses?: number;
}

interface Group {
  category_count?: number;
}

const StatCards = () => {
  const [, setAccounts] = useState<Account[]>([]);
  const [, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [users, setUsers] = useState<number>(0);
  const [monthlyBalance, setMonthlyBalance] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0); // Stan na licznik kategorii

  // Fetch financial summary and bank accounts from backend
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [budgetResponse, bankResponse, monthlyResponse] = await Promise.all([
          api.get("/api/budget/"),
          api.get("/api/banks/"),
          api.get("/api/balance/monthly/"),
        ]);

        setTotalIncome(budgetResponse.data.total_income);
        setAccounts(bankResponse.data);
        setMonthlyBalance(monthlyResponse.data.total_balance);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchSummary();
  }, []);

  // Fetch member count from the family API
  useEffect(() => {
    const fetchMemberCount = async () => {
      try {
        const response = await api.get(`/api/families/members/`);
        setUsers(response.data.member_count);
      } catch (error) {
        console.log("Error fetching family member count", error);
      }
    };
    fetchMemberCount();
  }, []);

  // Fetch total expenses from group balance API
  useEffect(() => {
    const fetchTotalExpenses = async () => {
      try {
        const response = await api.get("/api/group-balance/");
        const totalCategoryExpenses = response.data.reduce(
          (sum: number, group: GroupBalance) => sum + (group.total_expenses || 0),
          0
        );
        setTotalExpenses(totalCategoryExpenses);
      } catch (error) {
        console.error("Error fetching total expenses:", error);
      }
    };
    fetchTotalExpenses();
  }, []);

  // Fetch category count from the groups API
  useEffect(() => {
    const fetchCategoryCount = async () => {
      try {
        const response = await api.get("/api/groups/");
        const totalCategoryCount = response.data.reduce(
          (sum: number, group: Group) => sum + (group.category_count || 0),
          0
        );
        setCategoryCount(totalCategoryCount);
      } catch (error) {
        console.log("Error fetching category count:", error);
      }
    };

    fetchCategoryCount();
  }, []);

  const cards = [
    {
      title: "Users in family",
      value: `${users}`,
      icon: userIcon,
      profit: true,
      percentage: "8.5%",
    },
    {
      title: "Number of expenses",
      value: `${categoryCount}`,
      icon: ordersIcon,
      profit: false,
      percentage: "1.3%",
    },
    {
      title: "Income",
      value: `${monthlyBalance} zł`,
      icon: salesIcon,
      profit: true,
      percentage: "4.7%",
    },
    {
      title: "Expenses",
      value: `${totalExpenses} zł`,
      icon: revenueIcon,
      profit: false,
      percentage: "1.6%",
    },
  ];

  return (
    <div className="flex md:w-[95%] w-[80%] items-center justify-between flex-wrap md:flex-row flex-col md:gap-3 gap-5 mt-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow-sm pl-5 md:pr-10 pr-0 py-3 relative flex flex-col justify-between gap-3 md:w-[23%] w-full"
        >
          <span className="text-[#202224] font-semibold text-[15px]">{card.title}</span>
          <span className="text-[28px] font-bold text-[#202224]">{card.value}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
            </div>
          </div>
          <img
            src={card.icon}
            alt="icon"
            className="absolute right-5 top-3 w-[14.5%]"
          />
        </div>
      ))}
      <ToastContainer /> {/* Toastify container for notifications */}
    </div>
  );
};

export default StatCards;
