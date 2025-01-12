// groupService.ts
import api from '../api';

export const addGroup = async (groupTitle: string) => {
    if (groupTitle.trim() === '') {
        throw new Error("Tytuł grupy nie może być pusty.");
    }

    const newGroup = {
        groups_title: groupTitle,
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
        return response.data;
    } catch (error) {
        console.error('Error adding group:', error);
        throw error;
    }
};
