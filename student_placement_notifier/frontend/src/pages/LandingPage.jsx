import { Link } from 'react-router-dom';
import { BellRing, ShieldCheck, Target } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const features = [
  [Target, 'Smart matching', 'See instantly which drives you are eligible for — and exactly why not, if you are not.'],
  [BellRing, 'Instant notifications', 'Get emailed the moment a drive matching your profile is announced.'],
  [ShieldCheck, 'Secure & validated', 'Every field is validated on the frontend and the backend.'],
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-indigo-600 to-violet-600 py-20 text-center text-white">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-4xl font-bold sm:text-5xl">Never miss a placement drive again</h1>
            <p className="mt-4 text-lg text-indigo-100">
              Student Placement Notifier matches your academic profile with company drives and tells you where you can apply.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/student/register" className="btn bg-white text-indigo-700 hover:bg-indigo-50">Get started</Link>
              <Link to="/student/login" className="btn border border-white/60 text-white hover:bg-white/10">Student login</Link>
              <Link to="/admin/login" className="btn border border-white/60 text-white hover:bg-white/10">Admin / TPO</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-5xl gap-5 px-4 py-14 md:grid-cols-3">
          {features.map(([Icon, title, text]) => (
            <div key={title} className="card">
              <Icon className="h-8 w-8 text-indigo-600" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
