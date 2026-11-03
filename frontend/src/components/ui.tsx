import { ReactNode } from 'react';
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 p-5 ${className}`}>{children}</div>;
}
export function Btn({ children, onClick, variant = 'primary', type = 'button' as const, disabled }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger' | 'outline'; type?: 'button' | 'submit'; disabled?: boolean }) {
  const s = variant === 'primary' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90' : variant === 'danger' ? 'bg-red-600 text-white' : variant === 'outline' ? 'border border-zinc-300 dark:border-zinc-700' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800';
  return <button type={type} disabled={disabled} onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${s}`}>{children}</button>;
}
export function Badge({ children, tone = 'zinc' }: { children: ReactNode; tone?: 'zinc' | 'green' | 'amber' | 'red' | 'pink' }) {
  const m: Record<string, string> = { zinc: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300', green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m[tone]}`}>{children}</span>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span><div className="mt-1">{children}</div></label>;
}
export const inputCls = 'w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500';
export function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return <Card><p className="text-sm text-zinc-500">{label}</p><p className="text-3xl font-bold mt-1">{value}</p>{sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}</Card>;
}
