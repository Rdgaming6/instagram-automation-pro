import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, PlusCircle, Images, MessageSquare, Mail, BarChart3, Settings as SettingsIcon, Instagram, Moon, Sun } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Automations from './pages/Automations';
import CreateAutomation from './pages/CreateAutomation';
import Posts from './pages/Posts';
import Comments from './pages/Comments';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { isDemo } from './lib/api';
const nav = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard }, { to: '/automations', label: 'Automations', Icon: Zap },
  { to: '/create', label: 'Create Automation', Icon: PlusCircle }, { to: '/posts', label: 'Posts & Reels', Icon: Images },
  { to: '/comments', label: 'Comments', Icon: MessageSquare }, { to: '/templates', label: 'DM Templates', Icon: Mail },
  { to: '/analytics', label: 'Analytics', Icon: BarChart3 }, { to: '/settings', label: 'Settings', Icon: SettingsIcon },
];
export default function App() {
  const [dark, setDark] = useState(false);
  return <BrowserRouter><div className={dark ? 'dark' : ''}><div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
    <aside className="w-60 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hidden md:block">
      <div className="flex items-center gap-2 font-bold text-lg"><Instagram className="text-pink-500" /> Insta Automation <span className="text-xs font-normal text-zinc-400">Pro</span></div>
      {isDemo && <p className="mt-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-lg px-2 py-1">Demo mode — no real DMs sent</p>}
      <nav className="mt-6 space-y-1">{nav.map(({ to, label, Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${isActive ? 'bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}><Icon size={18} />{label}</NavLink>)}</nav>
    </aside>
    <main className="flex-1 p-4 md:p-8 max-w-6xl w-full">
      <div className="flex justify-end mb-4"><button onClick={() => setDark(!dark)} className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700" aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div>
      <Routes><Route path="/" element={<Dashboard />} /><Route path="/automations" element={<Automations />} /><Route path="/create" element={<CreateAutomation />} /><Route path="/posts" element={<Posts />} /><Route path="/comments" element={<Comments />} /><Route path="/templates" element={<Templates />} /><Route path="/analytics" element={<Analytics />} /><Route path="/settings" element={<Settings />} /></Routes>
    </main>
  </div></div></BrowserRouter>;
}
