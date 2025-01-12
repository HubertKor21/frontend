import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import api from "../../api";

function ChartPie() {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      labels: [],
      chart: { type: "polarArea" },
      stroke: { colors: ["#fff"] },
      fill: { opacity: 0.8 },
    },
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await api.get("/api/groups/");
        const data = response.data;

        const series = data.map((group) =>
          group.categories.reduce(
            (sum, category) => sum + category.assigned_amount,
            0
          )
        );
        const labels = data.map((group) => group.groups_title);

        setChartData({ series, options: { ...chartData.options, labels } });
      } catch (error) {
        console.error("Błąd podczas pobierania danych", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div id="chart "
    className="max-w-lg mx-auto p-5 bg-white rounded-lg shadow-md">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="polarArea"
      />
    </div>
  );
}

export default ChartPie;
