import { useState, useEffect } from 'react';
import ExpensesSection from './Expenses';
import api from '../api';

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



export function Drawer() {
    const [expensesSections, setExpensesSections] = useState<Group[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [allGroups, setAllGroups] = useState<Group[]>([]);


    useEffect(() => {
        const checkLoginStatus = async () => {
            const loggedIn = true; // Symulacja statusu zalogowania
            setIsLoggedIn(loggedIn);
            if (loggedIn) {
                await fetchGroups();
            }
        };
        checkLoginStatus();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/api/groups/');
            setExpensesSections(response.data);
            setAllGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };


    return (
        <div className="drawer">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <div className="bg-dark min-h p-8">
                    <div className="flex flex-col md:flex-row justify-center mt-4 space-x-4">
                        <div className="flex flex-col space-y-4 w-[90%] ">
                        {isLoggedIn && expensesSections.map((section, index) => (
                                <ExpensesSection
                                key={section.id}
                                group={section}
                                isFixed={index === 0}  // Pierwsza sekcja to "wydatki stałe"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Drawer;
