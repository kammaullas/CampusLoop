import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Share2,
  Copy,
  Check,
  QrCode,
  Send,
  ExternalLink,
  MailCheck,
  Users,
  Laptop,
  ShieldCheck,
  Download
} from 'lucide-react';

const MESSAGE_VARIANTS = [
  {
    id: 'outcome',
    label: 'Outcome & Resume-Led (Recommended)',
    tag: 'Best for placement prep',
    generate: (name, college, link) =>
      `Hi,\n\nI just registered for the free NxtWave workshop: "Build Your First AI Project in 60 Minutes".\n\nYou build an AI prototype you can explain in placement interviews. Zero prior ML experience required.\n\n${college ? `Students from ${college} are already signing up. ` : ''}It is completely free and takes 60 minutes.\n\nRegistration link: ${link}`,
  },
  {
    id: 'beginner',
    label: 'Beginner-Friendly',
    tag: 'For students new to AI',
    generate: (name, college, link) =>
      `Hi,\n\nThere is a free 60-minute online build session where you code a working AI project from scratch, even if you have not done Python or ML before.\n\nNo cost or setup needed. Good practical project to discuss in technical interviews.\n\nRegistration link: ${link}`,
  },
];

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const registration = location.state?.registration;
  const totalRegistrations = location.state?.totalRegistrations;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [activeVariant, setActiveVariant] = useState('outcome');
  const [showQR, setShowQR] = useState(false);

  // If no registration payload, redirect back to home
  useEffect(() => {
    if (!registration) {
      navigate('/', { replace: true });
    }
  }, [registration, navigate]);

  const baseUrl = window.location.origin;
  const referralLink = registration?.referralUrl
    ? (registration.referralUrl.includes('localhost') && !window.location.origin.includes('localhost')
        ? `${window.location.origin}/?ref=${registration.referralCode}&src=share`
        : registration.referralUrl)
    : `${baseUrl}/?ref=${registration?.referralCode || 'friend'}&src=share`;

  // Render QR Code on canvas
  useEffect(() => {
    if (referralLink && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, referralLink, {
        width: 180,
        margin: 2,
        color: {
          dark: '#070913',
          light: '#ffffff',
        },
      });
    }
  }, [referralLink, showQR]);

  if (!registration) return null;

  const activeMessage = MESSAGE_VARIANTS.find((v) => v.id === activeVariant);
  const messageText = activeMessage?.generate(
    registration.name,
    registration.college,
    referralLink
  );

  async function copyToClipboard(text, type) {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      } else {
        setCopiedMsg(true);
        setTimeout(() => setCopiedMsg(false), 2200);
      }
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      } else {
        setCopiedMsg(true);
        setTimeout(() => setCopiedMsg(false), 2200);
      }
    }
  }

  function openWhatsApp(text) {
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }

  function downloadQRCode() {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `nxtwave-workshop-qr-${registration.referralCode || 'pass'}.png`;
      a.href = url;
      a.click();
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 20px 60px 20px' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        
        {/* ── Celebratory Confirmation Header ────────────────────── */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '36px' }}>
          
          {/* Green Checkmark Circle (Preserved as requested) */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}>
            <CheckCircle2 size={46} color="#10b981" />
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '10px' }}>
            You're In, <span className="gradient-title">{registration.name.split(' ')[0]}</span>!
          </h1>
          
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '580px', margin: '0 auto 16px auto', lineHeight: 1.6 }}>
            Your workshop registration is confirmed. Schedule details and session access link will be dispatched to{' '}
            <strong style={{ color: '#22d3ee' }}>{registration.email}</strong>
          </p>

          {/* Student Batch Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            fontSize: '0.85rem',
            color: '#c7d2fe',
            fontWeight: 600,
          }}>
            <ShieldCheck size={16} color="#818cf8" />
            Verified Registration #{totalRegistrations || 252} • {registration.college}
          </div>
        </div>

        {/* ── Referral Growth Hub Card ────────────────────────────── */}
        <div className="glass-panel animate-fade-in" style={{
          padding: '32px',
          background: 'linear-gradient(180deg, rgba(22, 33, 62, 0.8) 0%, rgba(12, 16, 32, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '28px',
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Share2 size={18} color="#22d3ee" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Invite Project Partners</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Share your personal link with batchmates to build the prototype together.
                </p>
              </div>
            </div>

            {/* QR Toggle Button */}
            <button
              onClick={() => setShowQR(!showQR)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: showQR ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
              }}
            >
              <QrCode size={16} />
              {showQR ? 'Hide QR Code' : 'Show Poster QR'}
            </button>
          </div>

          {/* Quick Copy Link Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '24px',
          }}>
            <input
              type="text"
              readOnly
              value={referralLink}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                width: '100%',
                outline: 'none',
              }}
            />
            <button
              onClick={() => copyToClipboard(referralLink, 'link')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: copiedLink ? '#10b981' : '#6366f1',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              {copiedLink ? 'Copied Link' : 'Copy Link'}
            </button>
          </div>

          {/* Collapsible QR Code Panel */}
          {showQR && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '16px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              marginBottom: '24px',
            }}>
              <div style={{
                padding: '12px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                marginBottom: '12px',
              }}>
                <canvas ref={canvasRef} />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '14px' }}>
                Scan to open your referral link directly on mobile
              </p>
              <button
                onClick={downloadQRCode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={14} /> Download QR PNG
              </button>
            </div>
          )}

          {/* ── WhatsApp Message Hub ────────────────────────────── */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Share2 size={16} color="#25D366" /> Ready-to-Share WhatsApp Invite
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {activeMessage?.tag}
              </span>
            </div>

            {/* Message Style Selector Pills */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {MESSAGE_VARIANTS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVariant(v.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeVariant === v.id ? 'rgba(37, 211, 102, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: activeVariant === v.id ? '1px solid rgba(37, 211, 102, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: activeVariant === v.id ? '#4ade80' : '#94a3b8',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* WhatsApp Chat Preview Box */}
            <div style={{
              background: '#0b141a',
              border: '1px solid rgba(37, 211, 102, 0.25)',
              borderRadius: '14px',
              padding: '18px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              color: '#e9edef',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.55,
              position: 'relative',
              marginBottom: '16px',
            }}>
              <div style={{ position: 'absolute', top: '12px', right: '14px', fontSize: '0.74rem', color: '#8696a0' }}>
                WhatsApp Text Preview
              </div>
              {messageText}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <button
                onClick={() => openWhatsApp(messageText)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  background: '#25D366',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#070913',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(37, 211, 102, 0.35)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <Send size={18} />
                Send via WhatsApp
              </button>

              <button
                onClick={() => copyToClipboard(messageText, 'msg')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {copiedMsg ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                {copiedMsg ? 'Message Copied' : 'Copy Message Text'}
              </button>
            </div>

          </div>

        </div>

        {/* ── What Happens Next (Clean Stepper) ───────────────────── */}
        <div className="glass-panel animate-fade-in" style={{ padding: '28px 32px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '20px' }}>
            What Happens Next
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MailCheck size={18} color="#818cf8" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '2px' }}>1. Check Your Inbox</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Confirmation notice sent to {registration.email}. Schedule updates will follow.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Users size={18} color="#22d3ee" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '2px' }}>2. Form a Build Squad</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Share your link in your section WhatsApp group so friends can register.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Laptop size={18} color="#34d399" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '2px' }}>3. Show Up & Build</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Open your browser notebook, build your AI prototype, and save your code.
                </p>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#818cf8', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              ← Return to Workshop Homepage
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
