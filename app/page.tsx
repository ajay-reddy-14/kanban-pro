"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, Layout as LayoutIcon, Search, Bell, User, Sparkles } from "lucide-react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { Column, Id, Task, useKanbanStore } from "@/store/useKanbanStore";
import ColumnContainer from "@/components/ColumnContainer";
import TaskCard from "@/components/TaskCard";

export default function Home() {
    const {
        columns,
        tasks,
        addColumn,
        setColumns,
        setTasks,
        deleteTask,
        updateTask
    } = useKanbanStore();

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [mounted, setMounted] = useState(false);

    // Fix for hydration issues with dnd-kit
    useEffect(() => {
        setMounted(true);
    }, []);

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    if (!mounted) return null;

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAColumn = active.data.current?.type === "Column";
        if (!isActiveAColumn) return;

        const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
        const overColumnIndex = columns.findIndex((col) => col.id === overId);

        setColumns(arrayMove(columns, activeColumnIndex, overColumnIndex));
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if (!isActiveATask) return;

        // Dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            const activeIndex = tasks.findIndex((t) => t.id === activeId);
            const overIndex = tasks.findIndex((t) => t.id === overId);

            if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                const updatedTasks = [...tasks];
                updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], columnId: tasks[overIndex].columnId };
                setTasks(arrayMove(updatedTasks, activeIndex, overIndex));
            } else {
                setTasks(arrayMove(tasks, activeIndex, overIndex));
            }
        }

        // Dropping a Task over a Column
        const isOverAColumn = over.data.current?.type === "Column";
        if (isActiveATask && isOverAColumn) {
            const activeIndex = tasks.findIndex((t) => t.id === activeId);
            const updatedTasks = [...tasks];
            updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], columnId: overId };
            setTasks(arrayMove(updatedTasks, activeIndex, activeIndex));
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#020617] text-white selection:bg-indigo-500/30">
            {/* Header */}
            <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-5">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 group cursor-pointer transition-transform hover:scale-105 active:scale-95">
                        <LayoutIcon className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight flex items-center gap-2 italic text-white">
                            KANBAN <span className="text-indigo-500 not-italic">PRO</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Neural Sync Active</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-2.5 focus-within:border-indigo-500/50 focus-within:bg-white/[0.05] transition-all group">
                        <Search className="w-4 h-4 text-white/20 mr-3 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            placeholder="Search across all boards..."
                            className="bg-transparent border-none outline-none text-sm w-72 placeholder:text-white/10 font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-5">
                        <button className="p-3 hover:bg-white/5 rounded-2xl text-white/30 hover:text-white transition-all relative group">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-indigo-500 rounded-full border-[3px] border-[#020617]" />
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                3 New Alerts
                            </div>
                        </button>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-[1px] cursor-pointer hover:scale-105 transition-transform active:scale-95">
                            <div className="w-full h-full rounded-2xl bg-[#020617] flex items-center justify-center border border-white/5">
                                <User className="w-5 h-5 text-white/40" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Control Bar */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Engineering Roadmap</h2>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white/40`}>
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-[#020617] bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                            +8
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => addColumn(`New Section ${columns.length + 1}`)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group active:scale-95"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    NEW COLUMN
                </button>
            </div>

            {/* Board Layout */}
            <main className="flex-1 overflow-x-auto overflow-y-hidden bg-[#020617] p-8 scrollbar-thin scrollbar-thumb-white/10">
                <DndContext
                    sensors={sensors}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                >
                    <div className="flex gap-8 h-full min-w-max">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    tasks={tasks.filter((task) => task.columnId === col.id)}
                                />
                            ))}
                        </SortableContext>
                    </div>

                    {mounted && createPortal(
                        <DragOverlay>
                            {activeColumn && (
                                <ColumnContainer
                                    column={activeColumn}
                                    tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                                />
                            )}
                            {activeTask && (
                                <TaskCard
                                    task={activeTask}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                />
                            )}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </main>

            {/* Footer / Status */}
            <footer className="h-10 border-t border-white/5 bg-black/20 flex items-center justify-between px-8 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
                <div className="flex items-center gap-4">
                    <span>Cloud Sync: Syncing...</span>
                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Next.js 14 Engine Optimized</span>
                </div>
            </footer>
        </div>
    );
}
