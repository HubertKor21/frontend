import { useState, useEffect } from "react";
import Drawer from "../Drawer";
import api from "../../api";
import { Modal } from "../Modal/Modal";

interface Group {
    id: number;
    groups_title: string;
    groups_author: number;
    created_at: string;
    categories: any[];
    family: {
        name: string;
        members: any[];
    };
}

const OrdersTable = () => {
    const [, setTotalBalance] = useState<number>(0);
    const [currentMonth, setCurrentMonth] = useState<number>(0);
    const [currentYear, setCurrentYear] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [groups, setGroups] = useState<Group[]>([]); // State for groups

    // Fetch groups function
    const fetchGroups = async () => {
        try {
            const response = await api.get('/api/groups/');
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    // Add group function
    const addGroupHandler = async () => {
        if (newGroupTitle.trim() === '') {
            alert("Tytuł grupy nie może być pusty.");
            return;
        }

        const newGroup = {
            groups_title: newGroupTitle,
            groups_author: 0,
            created_at: new Date().toISOString(),
            categories: [],
            family: {
                name: "Nowa rodzina",
                members: [],
            },
        };

        try {
            const response = await api.post('/api/groups/', newGroup);
            setGroups([...groups, response.data]);
            setNewGroupTitle('');
            setIsModalOpen(false); // Close modal after adding group
        } catch (error) {
            console.error('Error adding group:', error);
        }
    };

    useEffect(() => {
        const fetchCurrentMonthBalance = async () => {
            try {
                const response = await api.get('/api/balance/monthly/');
                setCurrentMonth(response.data.month);
                setCurrentYear(response.data.year);
                setTotalBalance(response.data.total_balance);
                fetchGroups(); // Fetch groups when component loads
            } catch (error) {
                console.error('Error fetching current month balance:', error);
            }
        };

        fetchCurrentMonthBalance();
    }, []);

    // Month names for display
    const monthNames = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    

    return (
        <div className="md:w-[95%] w-[80%] bg-white shadow-sm rounded-xl mt-10 px-5 py-4 mb-8">
            <div className="flex w-full items-center justify-between mb-6">
                <span className="font-bold text-[#202224] text-[24px]">
                    {`${monthNames[currentMonth - 1]} ${currentYear}`}
                </span>
                <div>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">Add</button>
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onConfirm={addGroupHandler}
                        title="Add new group"
                        inputPlaceholder="Tittle group"
                        inputValue={newGroupTitle}
                        setInputValue={setNewGroupTitle}
                    />
                </div>
            </div>
            {/* Render groups here if needed */}
            <Drawer />
        </div>
    );
};

export default OrdersTable;
