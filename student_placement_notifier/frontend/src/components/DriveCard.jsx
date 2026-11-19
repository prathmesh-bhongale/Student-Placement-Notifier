import { Bookmark, BookmarkCheck, CalendarDays, CheckCircle2, MapPin, XCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const statusStyle = {
  active: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  closed: 'bg-slate-200 text-slate-600',
};

export default function DriveCard({ drive, onSave, onApply, busy }) {
  const c = drive.eligibilityCriteria || {};
  const criteria = [
    c.minPercent10 != null && `10th ≥ ${c.minPercent10}%`,
    c.minPercent12 != null && `12th ≥ ${c.minPercent12}%`,
    c.minDiplomaPercent != null && `Diploma ≥ ${c.minDiplomaPercent}%`,
    c.minSem6Percent != null && `Sem 6 ≥ ${c.minSem6Percent}%`,
    c.maxBacklogs != null && `Backlogs ≤ ${c.maxBacklogs}`,
    ...(c.requiredSkills || []),
  ].filter(Boolean);

  const closed = drive.status === 'closed';

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{drive.companyName}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{drive.location}</span>
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{format(new Date(drive.driveDate), 'dd MMM yyyy')}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`badge capitalize ${statusStyle[drive.status]}`}>{drive.status}</span>
          {drive.eligible ? (
            <span className="badge bg-emerald-100 text-emerald-700"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Eligible</span>
          ) : (
            <span className="badge bg-red-100 text-red-700"><XCircle className="mr-1 h-3.5 w-3.5" />Not eligible</span>
          )}
        </div>
      </div>

      <ul className="text-sm">
        {drive.jobPosts.map((p, i) => (
          <li key={i} className="flex justify-between border-b border-slate-100 py-1 last:border-0">
            <span>{p.title}</span><span className="text-slate-500">{p.vacancies} vacancies</span>
          </li>
        ))}
      </ul>

      <div
        className="line-clamp-3 text-sm text-slate-600"
        dangerouslySetInnerHTML={{ __html: drive.jobDescription }}
      />

      {criteria.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {criteria.map((x) => <span key={x} className="badge bg-slate-100 text-slate-600">{x}</span>)}
        </div>
      )}

      {!drive.eligible && drive.reasons?.length > 0 && (
        <ul className="list-disc rounded-lg bg-red-50 p-3 pl-7 text-xs text-red-700">
          {drive.reasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <button className="btn-secondary" disabled={busy} onClick={() => onSave(drive)}>
          {drive.isSaved ? <BookmarkCheck className="h-4 w-4 text-indigo-600" /> : <Bookmark className="h-4 w-4" />}
          {drive.isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          className="btn-primary"
          disabled={busy || !drive.eligible || drive.isApplied || closed}
          onClick={() => onApply(drive)}
        >
          {drive.isApplied ? 'Applied ✓' : closed ? 'Closed' : 'Apply'}
        </button>
        {drive.applyLink && (
          <a className="btn-secondary" href={drive.applyLink} target="_blank" rel="noreferrer noopener">
            <ExternalLink className="h-4 w-4" /> Link
          </a>
        )}
      </div>
    </div>
  );
}
