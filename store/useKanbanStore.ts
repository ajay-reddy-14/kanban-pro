import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Id = string | number;

export type Column = {
    id: Id;
    title: string;
};

export type Task = {
    id: Id;
    columnId: Id;
    content: string;
};

interface KanbanState {
    columns: Column[];
    tasks: Task[];
    addColumn: (title: string) => void;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;
    addTask: (columnId: Id, content: string) => void;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
    setTasks: (tasks: Task[]) => void;
    setColumns: (columns: Column[]) => void;
}

export const useKanbanStore = create<KanbanState>()(
    persist(
        (set) => ({
            columns: [
                { id: 'todo', title: 'To Do' },
                { id: 'doing', title: 'In Progress' },
                { id: 'done', title: 'Done' },
            ],
            tasks: [],
            addColumn: (title) =>
                set((state) => ({
                    columns: [...state.columns, { id: Math.floor(Math.random() * 10001), title }]
                })),
            deleteColumn: (id) =>
                set((state) => ({
                    columns: state.columns.filter((col) => col.id !== id),
                    tasks: state.tasks.filter((t) => t.columnId !== id)
                })),
            updateColumn: (id, title) =>
                set((state) => ({
                    columns: state.columns.map((col) => (col.id === id ? { ...col, title } : col)),
                })),
            addTask: (columnId, content) =>
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        { id: Math.floor(Math.random() * 10001), columnId, content },
                    ],
                })),
            deleteTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((task) => task.id !== id),
                })),
            updateTask: (id, content) =>
                set((state) => ({
                    tasks: state.tasks.map((task) => (task.id === id ? { ...task, content } : task)),
                })),
            setTasks: (tasks) => set({ tasks }),
            setColumns: (columns) => set({ columns }),
        }),
        {
            name: 'kanban-storage',
        }
    )
);
