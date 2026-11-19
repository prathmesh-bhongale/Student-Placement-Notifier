import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Briefcase, ClipboardCheck, Clock, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar.jsx';
import api, { getErrorMessage } from '../../utils/api.js';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data.data)).catch((e) => toast.error(getErrorMessage(e)));
  }, []);

  const s = data?.stats;
  const cards = s && [
    [Users, 'Students', s.totalStudents, 'text-indigo-600'],
    [Briefcase, 'Total drives', s.totalDrives, 'text-violet-600'],
    [Zap, 'Active drives', s.activeDrives, 'text-emerald-600'],
    [Clock, 'Upcoming', s.upcomingDrives, 'text-blue-600'],
    [ClipboardCheck, 'Applications', s.totalApplications, 'text-amber-600'],
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
        {!data ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {cards.map(([Icon, label, value, color]) => (
                <div key={label} className="card">
                  <Icon className={`h-6 w-6 ${color}`} />
                  <p className="mt-2 text-3xl font-bold">{value}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="card mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Recent drives</h2>
                <Link to="/admin/drives" className="text-sm text-indigo-600 hover:underline">Manage drives →</Link>
              </div>
              {data.recentDrives.length === 0 ? (
                <p className="text-sm text-slate-500">No drives yet. Create your first one from the Drives page.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recentDrives.map((d) => (
                    <li key={d._id} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium">{d.companyName}</span>
                      <span className="text-slate-500">{format(new Date(d.driveDate), 'dd MMM yyyy')} · <span className="capitalize">{d.status}</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
