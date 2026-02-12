import type { LucideIcon } from "lucide-react";

interface AdminKPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
}

export function AdminKPICard({ label, value, icon: Icon, subtitle }: AdminKPICardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/[0.03] border border-black/[0.02] relative overflow-hidden">
      <div className="absolute top-6 right-6 w-11 h-11 bg-[#f5f5f7] rounded-2xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-black/30" />
      </div>
      <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-2">
        {label}
      </p>
      <p className="text-3xl sm:text-4xl font-medium tracking-tighter text-black">
        {value}
      </p>
      {subtitle && (
        <p className="text-[12px] text-black/30 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
