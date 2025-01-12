/* eslint-disable @typescript-eslint/no-explicit-any */
import Sidebar from "../Component/Siebar";
import Navbar from "../Component/Navbar";
import { useEffect, useState } from 'react';
import FinanceSummary from "../Component/Finance";
import api from "../api";
import FamilyModal from "../Component/FamilyModal/FamilyModal";

interface Props {
  children: any;
}

const Layout = ({ children }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [userHasFamily, setUserHasFamily] = useState<boolean | null>(null); // To track if the user has a family

  useEffect(() =>{
    const fetchMembers = async () =>{
      try{
        const response = await api.get('api/families/members/')
        if (response && response.data){
          setUserHasFamily(true)
        } 
      }catch(error){
        setUserHasFamily(false);
        setShowFamilyModal(true);
      }
    }
    fetchMembers();
  },[]);

  const handleCreateFamily = async (familyName: string) => {
    try {
      const respone = await api.post('api/create-family/', {name: familyName});
      console.log('Family created succesfulyy:', respone);
      setShowFamilyModal(false);
    }catch(error){
      console.error('Error',error);
    }
  };

  const handleCloseModal = () => {
    setShowFamilyModal(false);
  };

  return (
    <div className="w-screen h-full bg-slate-100 relative">
      <Sidebar />
      <Navbar />
      <div className="ml-[76px] mt-[70px] border-t border-gray-200 px-6 py-3 box-border flex flex-col">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#202224] text-[30px]">Dashboard</span>
          <button
            className="bg-green-500 text-white p-2 rounded mr-16"
            onClick={() => setShowForm(!showForm)}
          >
            Add Balance
          </button>
        </div>
        {showForm && (
          <FinanceSummary showForm={showForm} setShowForm={setShowForm} />
        )}
        <FamilyModal
        isVisible={showFamilyModal}
        onClose={handleCloseModal}
        onCreateFamily={handleCreateFamily}
        />
        {children}
      </div>
    </div>
  );
};

export default Layout;
