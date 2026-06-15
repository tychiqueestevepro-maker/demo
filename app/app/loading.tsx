import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      <p className="text-sm font-medium text-violet-900/50 animate-pulse">
        Chargement des données...
      </p>
    </div>
  );
}
