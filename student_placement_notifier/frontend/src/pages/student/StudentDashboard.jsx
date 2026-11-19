import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar.jsx';
import DriveCard from '../../components/DriveCard.jsx';
import Chatbot from '../../components/Chatbot.jsx';
import api, { getErrorMessage } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const tabs = [
  ['all', 'All drives'],
  ['eligible', 'Eligible'],
  ['saved', 'Saved'],
  ['applied', 'Applied'],
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api.get('/students/matches')
      .then(({ data }) => setDrives(data.data.drives))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const patch = (id, changes) => setDrives((list) => list.map((d) => (d._id === id ? { ...d, ...changes } : d)));

  const handleSave = async (drive) => {
    setBusyId(drive._id);
    try {
      if (drive.isSaved) await api.delete(`/students/drives/${drive._id}/save`);
      else await api.post(`/students/drives/${drive._id}/save`);
      patch(drive._id, { isSaved: !drive.isSaved });
      toast.success(drive.isSaved ? 'Removed from saved' : 'Drive saved');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleApply = async (drive) => {
    setBusyId(drive._id);
    try {
      await api.post(`/students/drives/${drive._id}/apply`);
      patch(drive._id, { isApplied: true });
      toast.success(`Applied to ${drive.companyName}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    switch (tab) {
      case 'eligible': return drives.filter((d) => d.eligible && d.status !== 'closed');
      case 'saved': return drives.filter((d) => d.isSaved);
      case 'applied': return drives.filter((d) => d.isApplied);
      default: return drives;
    }
  }, [drives, tab]);

  const count = (key) => ({
    all: drives.length,
    eligible: drives.filter((d) => d.eligible && d.status !== 'closed').length,
    saved: drives.filter((d) => d.isSaved).length,
    applied: drives.filter((d) => d.isApplied).length,
  }[key]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Hello, {user?.name} 👋</h1>
        <p className="text-slate-500">Placement drives matched to your profile.</p>

        <div className="my-6 flex flex-wrap gap-2">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}
            >
              {label} ({count(key)})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-500">Loading drives…</p>
        ) : filtered.length === 0 ? (
          <div className="card text-center text-slate-500">No drives to show here yet.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((d) => (
              <DriveCard key={d._id} drive={d} busy={busyId === d._id} onSave={handleSave} onApply={handleApply} />
            ))}
          </div>
        )}
      </main>
      <Chatbot />
    </>
  );
}
