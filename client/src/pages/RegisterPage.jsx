import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  ShieldCheck,
  Users,
  User,
  Mail,
  Building2,
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Code2,
  Check
} from 'lucide-react';
import WorkshopAgenda from '../components/WorkshopAgenda';

const GRADUATION_YEAR_OPTIONS = [
  { value: 2026, label: 'Class of 2026 (Final Year — Primary Batch)' },
  { value: 2025, label: 'Class of 2025 (Recent Graduate / Final Year)' },
  { value: 2027, label: 'Class of 2027 (Pre-Final Year / 3rd Year)' },
  { value: 2028, label: 'Class of 2028 (2nd Year)' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const referralCode = searchParams.get('ref') || '';
  const source = searchParams.get('src') || (referralCode ? 'ambassador_referral' : 'direct');

  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    graduationYear: 2026,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [regCount, setRegCount] = useState(null);
  const [ambassadorInfo, setAmbassadorInfo] = useState(null);

  // Fetch verified real registration count
  useEffect(() => {
    fetch('/api/register/count')
      .then((r) => r.json())
      .then((data) => setRegCount(data.count))
      .catch(() => {});
  }, []);

  // Fetch referral ambassador or peer metadata if code exists
  useEffect(() => {
    if (referralCode) {
      fetch(`/api/register/ambassador/${referralCode}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.ambassador) setAmbassadorInfo(data.ambassador);
        })
        .catch(() => {});
    }
  }, [referralCode]);

  function validate() {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Please provide your full legal or college name.';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please provide a valid student or personal email.';
    }
    if (!form.college.trim() || form.college.trim().length < 2) {
      errs.college = 'Please enter your engineering college name.';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          college: form.college.trim(),
          graduationYear: parseInt(form.graduationYear, 10),
          referralCode: referralCode || undefined,
          source: source || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        navigate('/success', {
          state: {
            registration: data.registration,
            totalRegistrations: data.totalRegistrations,
          },
        });
      } else if (res.status === 409) {
        setServerError(data.message || 'This email address has already been registered.');
      } else if (res.status === 400 && data.errors) {
        const fieldErrors = {};
        data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setServerError('Unable to connect to server. Please check your connection and retry.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
      {/* ── Top Navigation Bar ───────────────────────────────────── */}
      <header style={{
        maxWidth: '1240px',
        margin: '0 auto 24px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
          }}>
            <Code2 size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.02em' }}>
              NxtWave <span style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.85rem' }}>BUILD LABS</span>
            </div>
          </div>
        </div>

        {/* Live Enrollment Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="radar-dot" />
          <span style={{ fontSize: '0.84rem', color: '#94a3b8', fontWeight: 500 }}>
            <strong style={{ color: '#fff' }}>{regCount !== null ? regCount : '—'}</strong> Verified Students Enrolled
          </span>
        </div>
      </header>

      {/* ── Main Two-Column Content ─────────────────────────────── */}
      <main className="app-container">
        <div className="split-hero-layout">
          
          {/* ── Left Column: Value Proposition, Agenda & Specs ────── */}
          <section className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Live Pill Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="pill-badge">
                <span className="radar-dot" />
                Live Build Workshop · Free Access
              </div>
              {ambassadorInfo && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#22d3ee',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}>
                  <Check size={14} />
                  Referred by {ambassadorInfo.name} ({ambassadorInfo.college})
                </div>
              )}
            </div>

            {/* Headline */}
            <div>
              <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', lineHeight: 1.1, marginBottom: '16px' }}>
                Build Your First <br />
                <span className="gradient-title">AI Project</span> in 60 Minutes
              </h1>
              <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '600px' }}>
                Build a working AI project you can explain in campus placement interviews. Zero prior Machine Learning experience required.
              </p>
            </div>

            {/* ── Project Showcase Card ─────────────────────────── */}
            <div className="glass-panel" style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.85)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#06b6d4', fontWeight: 700 }}>
                  Project Overview
                </span>
                <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <Check size={14} /> Beginner-Friendly Architecture
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                AI-Powered Resume Screener Prototype
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
                An educational prototype that parses resume text against job requirements, computes semantic similarity using an AI model, and produces fitment feedback.
              </p>

              {/* Architecture tags */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Python Cloud Notebook', 'Semantic Text Embeddings', 'AI Evaluation Model', 'Interview Talking Points'].map((tag) => (
                  <span key={tag} style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#e2e8f0',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Core Value Points ──────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Code2 size={20} color="#818cf8" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.02rem', color: '#fff', marginBottom: '2px' }}>Hands-on Coding</h4>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                    Follow step-by-step instructions to code and test a working prototype during the hour.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Briefcase size={20} color="#22d3ee" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.02rem', color: '#fff', marginBottom: '2px' }}>Interview Talking Points</h4>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                    Understand core design trade-offs, vector similarity, and how to discuss this project in technical interviews.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <GraduationCap size={20} color="#34d399" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.02rem', color: '#fff', marginBottom: '2px' }}>Zero Environment Setup</h4>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                    Runs in a browser cloud notebook. No heavy local GPU or complicated installations needed.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Prominent 60-Minute Workshop Agenda ───────────── */}
            <WorkshopAgenda />

            {/* ── Workshop Spec Grid (Explicitly labeled unconfirmed) ─ */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <Calendar size={14} /> DATE & TIME
                </div>
                <div style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: 600 }}>Unconfirmed (TBA)</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Dispatched via email</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <Clock size={14} /> DURATION
                </div>
                <div style={{ fontSize: '0.92rem', color: '#f1f5f9', fontWeight: 600 }}>60 Minutes</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Focused Build</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <ShieldCheck size={14} /> ENTRY
                </div>
                <div style={{ fontSize: '0.92rem', color: '#10b981', fontWeight: 700 }}>100% Free</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Educational Access</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <Users size={14} /> TARGET AUDIENCE
                </div>
                <div style={{ fontSize: '0.92rem', color: '#f1f5f9', fontWeight: 600 }}>Final-Year Engg</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Class of 2026 / 2025</div>
              </div>
            </div>

          </section>

          {/* ── Right Column: Registration Card ───────────────────── */}
          <aside className="animate-fade-in" style={{ position: 'sticky', top: '24px' }}>
            <div className="glass-panel" style={{
              padding: '36px 32px',
              background: 'linear-gradient(180deg, rgba(22, 33, 62, 0.85) 0%, rgba(12, 16, 32, 0.95) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
            }}>
              
              {/* Header inside Card */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.76rem',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono)',
                    color: '#06b6d4',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                  }}>
                    STUDENT ACCESS PASS
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Open Enrollment
                  </span>
                </div>

                <h2 style={{ fontSize: '1.65rem', color: '#fff', marginBottom: '6px' }}>
                  Claim Your Free Seat
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                  Free registration. Workshop access link and schedule details will be sent to your email.
                </p>
              </div>

              {/* Server-side Error Alert */}
              {serverError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  fontSize: '0.88rem',
                  marginBottom: '20px',
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{serverError}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                
                {/* Full Name */}
                <div className="input-field-group">
                  <label className="input-label" htmlFor="reg-name">Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      id="reg-name"
                      className={`modern-input ${errors.name ? 'error' : ''}`}
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <div className="field-error-text">
                      <AlertCircle size={14} /> {errors.name}
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div className="input-field-group">
                  <label className="input-label" htmlFor="reg-email">Student or Personal Email</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="reg-email"
                      className={`modern-input ${errors.email ? 'error' : ''}`}
                      type="email"
                      placeholder="e.g. priya@college.edu"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <div className="field-error-text">
                      <AlertCircle size={14} /> {errors.email}
                    </div>
                  )}
                </div>

                {/* College */}
                <div className="input-field-group">
                  <label className="input-label" htmlFor="reg-college">College / University</label>
                  <div className="input-wrapper">
                    <Building2 size={18} className="input-icon" />
                    <input
                      id="reg-college"
                      className={`modern-input ${errors.college ? 'error' : ''}`}
                      type="text"
                      placeholder="e.g. BITS Pilani / VIT / JNTU"
                      value={form.college}
                      onChange={(e) => handleChange('college', e.target.value)}
                    />
                  </div>
                  {errors.college && (
                    <div className="field-error-text">
                      <AlertCircle size={14} /> {errors.college}
                    </div>
                  )}
                </div>

                {/* Expected Graduation Year */}
                <div className="input-field-group">
                  <label className="input-label" htmlFor="reg-grad-year">Expected Graduation Year</label>
                  <div className="input-wrapper">
                    <CalendarClock size={18} className="input-icon" />
                    <select
                      id="reg-grad-year"
                      className="modern-input"
                      value={form.graduationYear}
                      onChange={(e) => handleChange('graduationYear', e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      {GRADUATION_YEAR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ background: '#0f172a', color: '#fff' }}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-cta-glow"
                  disabled={submitting}
                  style={{ marginTop: '10px' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="spin-icon" />
                      Reserving Your Pass...
                    </>
                  ) : (
                    <>
                      Reserve My Free Spot
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Trust Signals */}
                <div style={{
                  marginTop: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  fontSize: '0.78rem',
                  color: '#64748b',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} color="#10b981" /> 100% Free
                  </span>
                  <span>•</span>
                  <span>Confirmation Dispatched via Email</span>
                  <span>•</span>
                  <span>Zero Spam</span>
                </div>

              </form>

            </div>
          </aside>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{
        maxWidth: '1240px',
        margin: '40px auto 16px auto',
        padding: '24px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        color: '#64748b',
        fontSize: '0.85rem',
      }}>
        <div>
          © 2026 NxtWave Disruptive Technologies. Educational Simulation Prototype.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="/admin" style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            CampusLoop Growth Ops <ExternalLink size={14} />
          </a>
        </div>
      </footer>
    </div>
  );
}
