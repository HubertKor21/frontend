import ChartComponent from "../Chart";
import ChartPie from "../ChartPie";
import Monthly_Balance from "../Monthly-Charts";

const SalesChart = () => {
  return (
    <div className="w-full md:max-w-[95%] bg-white shadow-md rounded-xl mt-10 py-6 px-6">
      <div className="flex w-full items-center justify-between mb-6">
        <span className="font-bold text-[#202224] text-[24px]">Sales Chart</span>
      </div>
      <div className="flex flex-wrap justify-center space-x-54 gap-6">
        <div className="w-full md:w-1/2 lg:w-1/2"> {/* Dla małych ekranów 100%, średnich 50%, dużych 33% */}
          <ChartComponent />
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3"> {/* Dla małych ekranów 100%, średnich 50%, dużych 33% */}
          <ChartPie />
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3"> {/* Dla małych ekranów 100%, średnich 50%, dużych 33% */}
          <Monthly_Balance />
        </div>
      </div>
      
    </div>
  );
};

export default SalesChart;
