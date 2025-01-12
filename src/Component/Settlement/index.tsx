import { useState, useEffect } from "react";
import api from "../../api"; // Import axios setup
import { toast, ToastContainer } from "react-toastify";

interface Bank {
  id: number;
  user: number;
  bank_name: string;
  balance: number;
}

interface FamilyMember {
  email: string;
  first_name: string;
  last_name: string | null;
  id: number;
}

interface Family {
  member_count: number;
  members: FamilyMember[];
  id: number; // Zakładam, że rodzina ma ID
}

interface Settlement {
  id: number;
  family: number;
  debtor: number;
  creditor: number;
  amount: number;
  is_paid: boolean;
}

const Settlement = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [newSettlement, setNewSettlement] = useState<Partial<Settlement>>({});
  const [familyId, setFamilyId] = useState<number | null>(null); // Stan dla ID rodziny
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");


  // Fetch banks data
  const fetchBanks = async () => {
    try {
      const response = await api.get("/api/banks/");
      setBanks(response.data);
    } catch (error) {
      toast.error("Failed to fetch banks:");
    }
  };

  // Fetch family members data and set familyId
  const fetchFamilyMembers = async () => {
    try {
      const response = await api.get("/api/families/members/");
      setFamilyMembers(response.data.members);
      setFamilyId(response.data.id);
    } catch (error) {
      console.error("Failed to fetch family members:", error);
    }
  };

  // Fetch settlements data
  const fetchSettlements = async () => {
    try {
      const response = await api.get("/api/settlements/");
      setSettlements(response.data);
    } catch (error) {
      toast.error("Failed to fetch settlements:");
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBanks();
    fetchFamilyMembers();
    fetchSettlements();
  }, []);

  // Add new settlement
  const handleAddSettlement = async () => {
    if (newSettlement.debtor === newSettlement.creditor) {
      toast.error("Dłużnik i wierzyciel nie mogą być tą samą osobą.");
      return;
    }

    try {
      if (familyId === null) {
        toast.error("Brak ID rodziny");
        return;
      }

      const settlementData = {
        ...newSettlement,
        is_paid: false,
        family: familyId,
      };

      const response = await api.post("/api/settlements/", settlementData);
      setSettlements((prevSettlements) => [...prevSettlements, response.data]);
      setNewSettlement({});
    } catch (error) {
      toast.error("Wystąpił błąd podczas dodawania rozliczenia.");
    }
  };

  // Calculate total deposits
  const totalDeposits = banks.reduce((total, bank) => total + bank.balance, 0);

  const handleTogglePaid = async (settlementId: number) => {
    try {
      const currentSettlement = settlements.find((settlement) => settlement.id === settlementId);
      if (currentSettlement) {
        const updatedSettlement = {
          ...currentSettlement,
          is_paid: !currentSettlement.is_paid,
        };

        const response = await api.patch(`/api/settlements/${settlementId}/`, updatedSettlement);

        setSettlements((prevSettlements) =>
          prevSettlements.map((settlement) =>
            settlement.id === settlementId ? { ...settlement, ...response.data } : settlement
          )
        );
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas zmiany statusu rozliczenia.");
    }
  };

    const filteredSettlements = settlements.filter((settlement) => {
        if (filter === "paid") return settlement.is_paid;
        if (filter === "unpaid") return !settlement.is_paid;
        return true; // "all" shows all settlements
    });
  

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banks Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">Payments</h2>
          <ul className="space-y-2">
            {familyMembers.map((member) => {
              const userBank = banks.find((bank) => bank.user === member.id);
              const userDeposit = userBank ? userBank.balance : 0;

              // Calculate the progress for this user
              const progressValue = totalDeposits > 0 ? (userDeposit / totalDeposits) * 100 : 0;

              return (
                <li key={member.id} className="flex flex-col justify-between items-start space-y-2">
                  <div className="flex justify-between w-full">
                    <span className="font-semibold text-gray-600">{member.email}</span>
                    <span className="text-gray-600">{userDeposit} zł</span>
                  </div>

                  {/* Progress bar for the user */}
                  <div className="w-full">
                    <progress
                      className="progress progress-primary w-full"
                      value={Math.min(progressValue, 100)}
                      max="100"
                    ></progress>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">Payment percentage: {Math.round(progressValue)}%</span>
                      <span className="text-sm text-gray-600">Total payment: {totalDeposits} zł</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Settlements Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
  <h2 className="text-2xl font-bold text-gray-700">Settlements</h2>

        {/* Filter Buttons */}
        <div className="flex space-x-4">
            <button
            className={`btn ${filter === "all" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter("all")}
            >
            All
            </button>
            <button
            className={`btn ${filter === "paid" ? "btn-success" : "btn-outline"}`}
            onClick={() => setFilter("paid")}
            >
            Paid off
            </button>
            <button
            className={`btn ${filter === "unpaid" ? "btn-error" : "btn-outline"}`}
            onClick={() => setFilter("unpaid")}
            >
            Unpaid
            </button>
        </div>

        {/* Filtered Settlements */}
        <ul
            className="space-y-3 scrollable-settlements max-h-80 overflow-y-auto md:max-h-none transition-all duration-500 ease-in-out"
        >
            {filteredSettlements.map((settlement) => {
            const debtorEmail =
                familyMembers.find((member) => member.id === settlement.debtor)?.email || "Nieznany";
            const creditorEmail =
                familyMembers.find((member) => member.id === settlement.creditor)?.email || "Nieznany";
            return (
                <li key={settlement.id} className="flex justify-between items-center">
                <div className="space-y-1">
                    <div className="text-gray-800">
                    <span className="font-semibold">Debtor:</span> {debtorEmail}
                    </div>
                    <div className="text-gray-800">
                    <span className="font-semibold">Creditor:</span> {creditorEmail}
                    </div>
                    <div className="text-gray-800">
                    <span className="font-semibold">Sum:</span> {settlement.amount} zł
                    </div>
                </div>
                <button
                    onClick={() => handleTogglePaid(settlement.id)}
                    className={`btn ${settlement.is_paid ? "btn-success" : "btn-error"} text-white`}
                >
                    {settlement.is_paid ? "Paid off" : "Unpaid"}
                </button>
                </li>
            );
            })}
        </ul>
        </div>

      </div>

      {/* Add New Settlement */}
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-700">Add Settlement</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSettlement();
          }}
          className="space-y-4"
        >
          <div className="flex gap-4">
            <select
              value={newSettlement.debtor || ""}
              onChange={(e) => setNewSettlement({ ...newSettlement, debtor: Number(e.target.value) })}
              className="select select-bordered w-full"
            >
              <option value="">Select Debtor</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.email}
                </option>
              ))}
            </select>
            <select
              value={newSettlement.creditor || ""}
              onChange={(e) => setNewSettlement({ ...newSettlement, creditor: Number(e.target.value) })}
              className="select select-bordered w-full"
            >
              <option value="">Select Creditor</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.email}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={newSettlement.amount || ""}
            onChange={(e) => setNewSettlement({ ...newSettlement, amount: Number(e.target.value) })}
            className="input input-bordered w-full"
            placeholder="Sum"
          />
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Settlement;
