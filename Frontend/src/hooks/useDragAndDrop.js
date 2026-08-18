import { useState, useCallback } from 'react';

export function useDragAndDrop(tasks, onReorder) {
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);

    const handleDragStart = useCallback((e, task) => {
        setDraggedItem(task);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget);
    }, []);

    const handleDragOver = useCallback((e, task) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverItem(task);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverItem(null);
    }, []);

    const handleDrop = useCallback((e, targetTask) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedItem || draggedItem.id === targetTask.id) {
            setDraggedItem(null);
            setDragOverItem(null);
            return;
        }

        const draggedIndex = tasks.findIndex(t => t.id === draggedItem.id);
        const targetIndex = tasks.findIndex(t => t.id === targetTask.id);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedItem(null);
            setDragOverItem(null);
            return;
        }

        const newTasks = [...tasks];
        newTasks.splice(draggedIndex, 1);
        newTasks.splice(targetIndex, 0, draggedItem);

        onReorder(newTasks);
        setDraggedItem(null);
        setDragOverItem(null);
    }, [draggedItem, tasks, onReorder]);

    const handleDragEnd = useCallback(() => {
        setDraggedItem(null);
        setDragOverItem(null);
    }, []);

    return {
        draggedItem,
        dragOverItem,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd
    };
}
