import { useEffect, useState } from "react";
import api from "../../api";
import { CaretDown, CaretUp } from "react-ionicons";
import userIcon from "../../assets/images/userIcon.png";
import salesIcon from "../../assets/images/salesIcon.png";
import ordersIcon from "../../assets/images/ordersIcon.png";
import revenueIcon from "../../assets/images/revenueIcon.png";
import { toast, ToastContainer } from "react-toastify";  // Import toastify
import "react-toastify/dist/ReactToastify.css";  // Import stylów

interface Account {
  id: number;
  bank_name: string;
  balance: number;
}

const StatCards = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [users, setUsers] = useState<number>(0);
  const [monthlyBalance, setMonthlyBalance] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);  // Nowy stan na licznik kategorii

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
        // setTotalExpenses(response.data[0].total_expenses);
        const totalCategoryExpenses = response.data.reduce(
          (sum, group) => sum + (group.total_expenses || 0),0
        );
        setTotalExpenses(totalCategoryExpenses);
      } catch (error) {
        console.error("Error fetching total expenses:", error);
      }
    };
    fetchTotalExpenses();
  }, []);

  useEffect(() => {
    const fetchCategoryCount = async () => {
      try {
        const response = await api.get("/api/groups/");
        // Sumujemy liczby kategorii ze wszystkich grup
        const totalCategoryCount = response.data.reduce(
          (sum, group) => sum + (group.category_count || 0),
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
              {card.profit ? <CaretUp color="#00B69B" /> : <CaretDown color="#F93C65" />}
              <span
                className={`${
                  card.profit ? "text-[#00B69B]" : "text-[#F93C65]"
                } font-semibold text-[15px]`}
              >
                {card.percentage}
              </span>
            </div>
            <span className="text-[#606060] text-[14px]">
              {card.profit ? "Up from month" : "Down from month"}
            </span>
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
