import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import api from "../../api"; // Przykład z API, dostosuj do swojego importu

interface MonthlyBalanceItem {
  month: number;
  total_balance: number;
  total_expenses: number;
}

const Monthly_Balance = () => {
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Balance",
        data: []
      },
      {
        name: "Expenses",
        data: []
      }
    ],
    options: {
      chart: {
        type: "bar" as "bar",
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 5,
          borderRadiusApplication: "end" as "end"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: []
      },
      yaxis: {
        title: {
          text: "$"
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return "$ " + val;
          }
        }
      }
    }
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await api.get("/api/balance/all-mounths/"); // Pobierz dane z API
        const data = response.data;

        // Przygotowanie danych wykresu
        const months = data.monthly_balances.map((item: MonthlyBalanceItem) => {
          const monthName = new Date(0, item.month - 1).toLocaleString("default", { month: "short" });
          return monthName;
        });

        const balances = data.monthly_balances.map((item: MonthlyBalanceItem) => item.total_balance);
        const expenses = data.monthly_balances.map((item: MonthlyBalanceItem) => item.total_expenses);

        setChartData({
          series: [
            {
              name: "Income",
              data: balances
            },
            {
              name: "Expenses",
              data: expenses
            }
          ],
          options: {
            ...chartData.options,
            xaxis: {
              categories: months
            }
          }
        });
      } catch (error) {
        console.error("Błąd podczas pobierania danych", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

export default Monthly_Balance;
