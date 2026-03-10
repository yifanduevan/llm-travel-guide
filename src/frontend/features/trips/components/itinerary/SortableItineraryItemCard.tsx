"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ClientItineraryItem } from "./types";
import ItineraryItemCard from "./ItineraryItemCard";

type SortableItineraryItemCardProps = {
  id: string;
  item: ClientItineraryItem;
  editable: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export default function SortableItineraryItemCard({
  id,
  item,
  editable,
  onEdit,
  onDelete,
}: SortableItineraryItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: !editable,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-0" : ""}
      {...attributes}
      {...listeners}
    >
      <ItineraryItemCard
        item={item}
        editable={editable}
        onEdit={onEdit}
        onDelete={onDelete}
        dragEnabled={editable}
      />
    </div>
  );
}
