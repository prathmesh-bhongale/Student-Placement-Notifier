import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Bell, Pencil, Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar.jsx';
import Modal from '../../components/Modal.jsx';
import DriveForm from '../../components/DriveForm.jsx';
import api, { getErrorMessage } from '../../utils/api.js';

const statusStyle = { active: 'bg-green-100 text-green-700', upcoming: 'bg-blue-100 text-blue-700', closed: 'bg-slate-200 text-slate-600' };

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: 'form', drive? } | { type: 'eligible', drive, students }
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/drives');
      setDrives(data.data.drives);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (payload) => {
    try {
      if (modal.drive) {
        await api.put(`/admin/drives/${modal.drive._id}`, payload);
        toast.success('Drive updated');
      } else {
        const { data } = await api.post('/admin/drives', payload);
        const n = data.data.notification;
        toast.success(n ? `Drive created. Notified ${n.sent} of ${n.eligible} eligible students` : 'Drive created');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err; // let the form show field errors
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete the ${d.companyName} drive? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/drives/${d._id}`);
      toast.success('Drive deleted');
      load();
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  const notify = async (d) => {
    setBusyId(d._id);
    try {
      const { data } = await api.post(`/admin/drives/${d._id}/notify`);
      toast.success(data.message);
      load();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusyId(null); }
  };

  const showEligible = async (d) => {
    try {
      const { data } = await api.get(`/admin/drives/${d._id}/eligible-students`);
      setModal({ type: 'eligible', drive: d, students: data.data.students });
    } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Placement Drives</h1>
          <button className="btn-primary" onClick={() => setModal({ type: 'form' })}><Plus className="h-4 w-4" /> Create drive</button>
        </div>

        {loading ? <p className="text-slate-500">Loading…</p> : drives.length === 0 ? (
          <div className="card text-center text-slate-500">No drives yet. Click “Create drive” to add one.</div>
        ) : (
          <div className="card overflow-x-auto !p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Company</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th><th className="px-4 py-3">Notified</th><th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.map((d) => (
                  <tr key={d._id}>
                    <td className="px-4 py-3 font-medium">{d.companyName}<div className="text-xs font-normal text-slate-500">{d.jobPosts.map((p) => p.title).join(', ')}</div></td>
                    <td className="px-4 py-3">{format(new Date(d.driveDate), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3">{d.location}</td>
                    <td className="px-4 py-3"><span className={`badge capitalize ${statusStyle[d.status]}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-slate-500">{d.notifiedAt ? format(new Date(d.notifiedAt), 'dd MMM, HH:mm') : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button title="Eligible students" className="btn-secondary !px-2" onClick={() => showEligible(d)}><Users className="h-4 w-4" /></button>
                        <button title="Notify eligible students" className="btn-secondary !px-2" disabled={busyId === d._id} onClick={() => notify(d)}><Bell className="h-4 w-4" /></button>
                        <button title="Edit" className="btn-secondary !px-2" onClick={() => setModal({ type: 'form', drive: d })}><Pencil className="h-4 w-4" /></button>
                        <button title="Delete" className="btn-danger !px-2" onClick={() => remove(d)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal?.type === 'form' && (
        <Modal wide title={modal.drive ? 'Edit drive' : 'Create drive'} onClose={() => setModal(null)}>
          <DriveForm drive={modal.drive} onSubmit={save} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'eligible' && (
        <Modal title={`Eligible students – ${modal.drive.companyName} (${modal.students.length})`} onClose={() => setModal(null)}>
          {modal.students.length === 0 ? <p className="text-slate-500">No registered student matches this drive yet.</p> : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto text-sm">
              {modal.students.map((s) => (
                <li key={s.id} className="py-2"><span className="font-medium">{s.name}</span> <span className="text-slate-500">· {s.prn} · {s.email}</span></li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </>
  );
}
