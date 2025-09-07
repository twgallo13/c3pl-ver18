import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/Toast";
import EmptyState from "../clients/EmptyState";
import { getInventory, removeInventoryItem } from "../../lib/repos/inventoryRepo";
import { InventoryItem } from "../../lib/contracts";
import { z } from "zod";

export default function InventoryDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { push } = useToast();
  const [item, setItem] = useState<z.infer<typeof InventoryItem> | undefined>(undefined);

  // Load inventory item
  useEffect(() => {
    if (!id) return;
    const foundItem = getInventory().find(item => item.id === id);
    setItem(foundItem);
  }, [id]);

  if (!item) {
    return (
      <EmptyState
        title="Item not found"
        subtitle="It may have been deleted or the link is incorrect."
      />
    );
  }

  const onDelete = async () => {
    if (!confirm("Delete this inventory item?")) return;
    try {
      removeInventoryItem(item.id);
      push({ text: "Item deleted", kind: "success" });
      nav("/inventory");
    } catch {
      push({ text: "Failed to delete item", kind: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{item.name}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="muted"
            onClick={() => nav(`/inventory/${item.id}/edit`)}
            aria-label="Edit"
          >
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete} aria-label="Delete">
            Delete
          </Button>
          <Link to="/inventory">
            <Button variant="ghost" aria-label="Back">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldDisplay label="SKU" value={item.sku} />
        <FieldDisplay label="Location" value={item.location ?? "-"} />
        <FieldDisplay label="Quantity On Hand" value={String(item.qtyOnHand ?? 0)} />
        <FieldDisplay label="Quantity Allocated" value={String(item.qtyAllocated ?? 0)} />
      </div>
    </div>
  );
}

function FieldDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}