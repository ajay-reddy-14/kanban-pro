"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Id, Task, useKanbanStore } from "@/store/useKanbanStore";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";

interface Props {
    column: Column;
    tasks: Task[];
}

export default function ColumnContainer({ column, tasks }: Props) {
    const { deleteColumn, updateColumn, addTask, deleteTask, updateTask } = useKanbanStore();
    const [editMode, setEditMode] = useState(false);

    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white/[0.02] w-80 h-[500px] max-h-[500px] rounded-2xl border-2 border-indigo-500 opacity-20 flex flex-col"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white/[0.03] w-80 h-[500px] max-h-[500px] rounded-2xl flex flex-col border border-white/5 shadow-xl"
        >
            {/* Column title */}
            <div
                {...attributes}
                {...listeners}
                onClick={() => setEditMode(true)}
                className="text-sm font-bold bg-white/5 p-4 rounded-t-2xl flex items-center justify-between border-b border-white/5 cursor-grab"
            >
                <div className="flex gap-2 items-center">
                    <div className="flex justify-center items-center bg-indigo-500/20 px-2 py-1 text-xs rounded-lg text-indigo-400">
                        {tasks.length}
                    </div>
                    {!editMode && <span className="text-white/80">{column.title}</span>}
                    {editMode && (
                        <input
                            className="bg-black/40 focus:border-indigo-500 border rounded outline-none px-2 py-1 text-white border-white/10"
                            value={column.title}
                            onChange={(e) => updateColumn(column.id, e.target.value)}
                            autoFocus
                            onBlur={() => setEditMode(false)}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                setEditMode(false);
                            }}
                        />
                    )}
                </div>
                <button
                    onClick={() => deleteColumn(column.id)}
                    className="stroke-gray-500 hover:stroke-white hover:bg-red-500/10 p-1.5 rounded transition-all"
                >
                    <Trash2 className="w-4 h-4 text-white/20 hover:text-red-400" />
                </button>
            </div>

            {/* Column task container */}
            <div className="flex flex-grow flex-col gap-4 p-4 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    ))}
                </SortableContext>
            </div>

            {/* Column footer */}
            <button
                className="flex gap-2 items-center border-white/5 border-t p-4 hover:bg-white/5 hover:text-indigo-400 text-white/40 transition-all rounded-b-2xl active:bg-black"
                onClick={() => {
                    addTask(column.id, "");
                }}
            >
                <Plus className="w-4 h-4" />
                <span className="text-xs font-semibold">New Task</span>
            </button>
        </div>
    );
}
