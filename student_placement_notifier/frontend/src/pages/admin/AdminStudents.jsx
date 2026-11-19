import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar.jsx';
import api, { getErrorMessage } from '../../utils/api.js';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/admin/students', { params: { search } })
        .then(({ data }) => setStudents(data.data.students))
        .catch((e) => toast.error(getErrorMessage(e)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Students ({students.length})</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input !pl-9" placeholder="Search name, email or PRN" value={search} onChange={(e) => setSearch(e.target.value)} maxLength={100} />
          </div>
        </div>
        {loading ? <p className="text-slate-500">Loading…</p> : students.length === 0 ? (
          <div className="card text-center text-slate-500">No students found.</div>
        ) : (
          <div className="card overflow-x-auto !p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th><th className="px-4 py-3">PRN</th><th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th><th className="px-4 py-3">10th %</th><th className="px-4 py-3">Backlogs</th><th className="px-4 py-3">Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium">{s.name}</td><td className="px-4 py-3">{s.prn}</td><td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3">{s.phone}</td><td className="px-4 py-3">{s.percentage10}</td><td className="px-4 py-3">{s.backlogs}</td>
                    <td className="px-4 py-3">{(s.skills || []).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
