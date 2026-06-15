"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Trash2 } from "lucide-react";

import { pauseCampaignAction, deleteCampaignAction } from "@/app/actions/campaign-controls";

export function CampaignControls({
  campaignId,
  currentStatus,
}: {
  campaignId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [optimisticStatus, setOptimisticStatus] = React.useState<string | null>(null);
  const [isPausing, setIsPausing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const localStatus = optimisticStatus ?? currentStatus;
  const isPaused = localStatus === "PAUSED";

  const handlePause = async () => {
    setIsPausing(true);
    const nextStatus = isPaused ? "ACTIVE" : "PAUSED";
    setOptimisticStatus(nextStatus);

    try {
      const result = await pauseCampaignAction(campaignId);
      setOptimisticStatus(result.status);
      router.refresh();
    } catch {
      setOptimisticStatus(null);
    } finally {
      setIsPausing(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteCampaignAction(campaignId);
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Pause / Resume */}
      <button
        onClick={handlePause}
        disabled={isPausing}
        className={[
          "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50",
          isPaused
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700",
        ].join(" ")}
      >
        {isPausing ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current" />
        ) : isPaused ? (
          <Play className="h-4 w-4" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
        {isPaused ? "Activate" : "Pause"}
      </button>

      {/* Delete */}
      {showDeleteConfirm ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
          <span className="text-sm font-semibold text-rose-700">Confirm?</span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {isDeleting ? "..." : "Yes, delete"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="text-xs text-rose-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      )}
    </div>
  );
}
