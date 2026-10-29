import { Clock, CheckCircle2, Laptop, Code2, AlertCircle, ArrowRight } from 'lucide-react';

const AGENDA_STAGES = [
  {
    time: '00–05 min',
    title: 'Problem Introduction & Setup',
    activity: 'Define the resume screening problem and launch the browser-based coding notebook.',
    outcome: 'Project goal understood; coding environment ready without any local setup.',
    color: '#818cf8',
  },
  {
    time: '05–15 min',
    title: 'AI Workflow & Concepts',
    activity: 'Walk through how semantic text embeddings and language models compare candidate text against job criteria.',
    outcome: 'Understand the difference between keyword matching and semantic similarity.',
    color: '#06b6d4',
  },
  {
    time: '15–35 min',
    title: 'Build the Core AI Prototype (Live Sprint)',
    activity: 'Write the core Python code to load a resume, send text to an AI model, and generate a match score with rationale.',
    outcome: 'A working minimum AI prototype running and outputting evaluation results.',
    color: '#34d399',
  },
  {
    time: '35–50 min',
    title: 'Test & Customise the Prototype',
    activity: 'Run test cases with sample engineering resumes, tune prompt instructions, and handle basic edge cases.',
    outcome: 'A customized, tested prototype tailored to engineering roles.',
    color: '#f59e0b',
  },
  {
    time: '50–55 min',
    title: 'Project Review & Interview Framing',
    activity: 'Review what was built and discuss how to explain this project\'s design decisions in technical placement interviews.',
    outcome: 'Clear talking points for resume and interview discussion.',
    color: '#a855f7',
  },
  {
    time: '55–60 min',
    title: 'Q&A & Next Steps',
    activity: 'Participant questions and code wrap-up.',
    outcome: 'Clarifications answered and reference code saved.',
    color: '#38bdf8',
  },
];

export default function WorkshopAgenda() {
  return (
    <section className="glass-panel" style={{
      padding: '32px 28px',
      background: 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginTop: '12px',
    }}>
      {/* ── Section Header ─────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '10px',
        }}>
          <Clock size={14} /> 60-Minute Workshop Agenda
        </div>

        <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
          What You'll Build in 60 Minutes
        </h3>
        <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.5, maxWidth: '720px' }}>
          A realistic, beginner-focused build session. Focus is on shipping one working AI prototype within the hour, keeping complex infrastructure optional.
        </p>
      </div>

      {/* ── Scope Distinction: In-Scope vs Optional ─────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '12px',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            ✓ Core 60-Minute Scope (Achievable for Beginners)
          </div>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            A functioning Python-based AI prototype in a cloud notebook that ingests resume text, queries an AI model, and produces fitment scores with structured reasoning.
          </p>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            ✦ Optional Self-Paced Extensions (Post-Session)
          </div>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.45 }}>
            Building a multi-page web UI, deploying a production server to cloud hosting, or connecting a vector database are provided as optional extension exercises for after the workshop.
          </p>
        </div>
      </div>

      {/* ── Agenda Timeline Grid ────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {AGENDA_STAGES.map((s, idx) => (
          <div
            key={s.time}
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: s.color,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                }}>
                  {s.time}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  STAGE 0{idx + 1}
                </span>
              </div>

              <h4 style={{ fontSize: '0.98rem', color: '#fff', marginBottom: '6px', lineHeight: 1.3 }}>
                {s.title}
              </h4>

              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45, marginBottom: '12px' }}>
                {s.activity}
              </p>
            </div>

            <div style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#34d399',
            }}>
              <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Expected Milestone:</strong> {s.outcome}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Prerequisites & Resources Transparency ─────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        padding: '20px',
        background: 'rgba(10, 15, 28, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
      }}>
        {/* Planned Workshop Resources */}
        <div>
          <h4 style={{ fontSize: '0.88rem', color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Code2 size={15} /> Workshop Resources & Deliverables
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: '#cbd5e1' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
              <span><strong>Delivered In-Session:</strong> Browser cloud notebook (zero local installation or environment configuration required).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
              <span><strong>Delivered In-Session:</strong> Working Python starter script and sample engineering resumes.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 700 }}>—</span>
              <span><strong>Outside 60-Min Scope:</strong> Vector databases, cloud server deployment, and web frontends are excluded from the live session and provided only as optional takeaway reading. No certificates, paid API purchases, or commercial software licenses are promised.</span>
            </li>
          </ul>
        </div>

        {/* Prerequisites */}
        <div>
          <h4 style={{ fontSize: '0.88rem', color: '#a5b4fc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Laptop size={15} /> What You Need (Prerequisites)
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: '#cbd5e1' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#a5b4fc', fontWeight: 700 }}>•</span>
              <span>Laptop with a modern web browser (Chrome, Edge, Firefox, or Safari) and stable internet.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#a5b4fc', fontWeight: 700 }}>•</span>
              <span>Basic coding awareness in any programming language (Python concepts explained during the session).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
              <span style={{ color: '#34d399' }}>Zero prior Machine Learning, PyTorch, or advanced mathematics required.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
