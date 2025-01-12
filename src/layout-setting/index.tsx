/* eslint-disable @typescript-eslint/no-explicit-any */
import Sidebar from "../Component/Siebar";
import Navbar from "../Component/Navbar";

interface Props {
  children: any;
}

const Layout_settings = ({ children }: Props) => {

  return (
    <div className="w-screen bg-slate-100 relative">
      <Sidebar />
      <Navbar />
      <div className="ml-[76px] mt-[70px] border-t border-gray-200 px-6 py-3 box-border flex flex-col h-screen">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#202224] text-[30px]">Settings</span>

        </div>
        {children}
      </div>
    </div>
  );
};

export default Layout_settings;
