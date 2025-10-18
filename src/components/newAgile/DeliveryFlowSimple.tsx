import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SimpleTask {
  id: string;
  title: string;
  status: 'ready' | 'in_progress' | 'done';
}

interface DeliveryFlowSimpleProps {
  projectId: string;
  className?: string;
}

const DeliveryFlowSimple: React.FC<DeliveryFlowSimpleProps> = ({ projectId, className = '' }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Simple mock tasks
  const [tasks, setTasks] = useState<SimpleTask[]>([
    { id: '1', title: 'Test Task 1', status: 'ready' },
    { id: '2', title: 'Test Task 2', status: 'in_progress' },
    { id: '3', title: 'Test Task 3', status: 'done' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    console.log('Drag ended:', event);
  };

  // Simple Task Card component
  const SimpleTaskCard = ({ task }: { task: SimpleTask }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white/10 border border-white/20 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing"
      >
        <h4 className="text-white text-sm">{task.title}</h4>
        <span className="text-white/60 text-xs">{task.status}</span>
      </div>
    );
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
      <div className="p-6 border-b border-white/20">
        <h2 className="text-2xl font-bold text-white">Simple Delivery Flow</h2>
        <p className="text-white/70">Testing DnD functionality - Project: {projectId}</p>
      </div>

      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 gap-4">
            {['ready', 'in_progress', 'done'].map(status => {
              const columnTasks = tasks.filter(task => task.status === status);

              return (
                <div key={status} className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3 capitalize">{status.replace('_', ' ')}</h3>
                  <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {columnTasks.map(task => (
                      <SimpleTaskCard key={task.id} task={task} />
                    ))}
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default DeliveryFlowSimple;