import { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, MapPin, MessageSquare, Send, CheckCircle2, RefreshCw, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [blinkOn, setBlinkOn] = useState(false);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    setListError(null);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      setListError(error.message);
    } else {
      const rows = (data ?? []) as ContactMessage[];
      setMessages(rows);
      setUnreadCount(rows.filter((r) => !r.is_read).length);
    }
    setLoadingMessages(false);
  }, []);

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) {
      setListError(error.message);
      return;
    }
    setUnreadCount(0);
    setMessages((prev) => prev.map((r) => ({ ...r, is_read: true })));
  }, [unreadCount]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Blink when there are unread messages
  useEffect(() => {
    if (unreadCount > 0) {
      blinkTimerRef.current = setInterval(() => {
        setBlinkOn((v) => !v);
      }, 600);
      return () => {
        if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
        setBlinkOn(false);
      };
    } else {
      setBlinkOn(false);
    }
  }, [unreadCount]);

  // Realtime subscription: blink when a new message is inserted
  useEffect(() => {
    const channel = supabase
      .channel('contact-messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setSent(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    window.setTimeout(() => setSent(false), 4000);
    loadMessages();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackdropGlow />

      <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-8">
        {/* Unread messages blinking banner */}
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className={`mb-6 flex w-full items-center justify-center gap-3 rounded-xl border px-5 py-3 transition-all duration-200 ${
              blinkOn
                ? 'border-cyan-400/60 bg-cyan-500/15 shadow-lg shadow-cyan-500/20'
                : 'border-cyan-400/20 bg-cyan-500/5'
            }`}
          >
            <span className={`relative flex h-3 w-3 ${blinkOn ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full bg-cyan-400 ${blinkOn ? 'animate-ping' : ''}`} />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400" />
            </span>
            <Bell className={`h-4 w-4 transition-colors ${blinkOn ? 'text-cyan-300' : 'text-cyan-400/70'}`} />
            <span className={`text-sm font-semibold transition-colors ${blinkOn ? 'text-cyan-200' : 'text-cyan-300/80'}`}>
              {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'} — click to mark as read
            </span>
          </button>
        )}

        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5">
            <Mail className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-[11px] font-medium tracking-widest text-white/60">GET IN TOUCH</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-lg text-white/50">
            Questions, partnerships, or just want to say hello? We read every message.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.5fr]">
          {/* Info column */}
          <div className="flex flex-col gap-4">
            <InfoCard icon={Mail} title="Email" value="hello@arcadeai.games" accent="#06b6d4" />
            <InfoCard icon={MessageSquare} title="Discord" value="Join the community" accent="#22c55e" />
            <InfoCard icon={MapPin} title="Location" value="Remote · Worldwide" accent="#f59e0b" />
          </div>

          {/* Form column */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Message sent!</h3>
                <p className="mt-2 text-sm text-white/50">We'll get back to you within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                    />
                  </Field>
                </div>
                <Field label="Subject">
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </Field>
                <Field label="Message">
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </Field>
                {submitError && (
                  <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                    {submitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Messages inbox */}
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Messages</h2>
              <p className="mt-0.5 text-sm text-white/45">
                {messages.length > 0
                  ? `${messages.length} ${messages.length === 1 ? 'message' : 'messages'} received`
                  : 'No messages yet — be the first to reach out!'}
              </p>
            </div>
            <button
              onClick={loadMessages}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Refresh messages"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loadingMessages ? (
            <div className="flex items-center justify-center py-12 text-sm text-white/40">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading messages...
            </div>
          ) : listError ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              Could not load messages: {listError}
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-12 text-center">
              <Mail className="mx-auto mb-3 h-10 w-10 text-white/20" />
              <p className="text-sm text-white/40">No one has sent a message yet. Your message will be the first!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl border p-5 transition ${
                    msg.is_read
                      ? 'border-white/10 bg-white/[0.02]'
                      : 'border-cyan-400/30 bg-cyan-500/[0.04]'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/30">
                        <Mail className="h-4 w-4 text-cyan-300" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white">{msg.name}</span>
                        <span className="ml-2 text-[11px] text-white/35">{msg.email}</span>
                        <span className="ml-2 text-[11px] font-medium text-white/35">{timeAgo(msg.created_at)}</span>
                      </div>
                    </div>
                    {!msg.is_read && (
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-cyan-300 ring-1 ring-cyan-400/30">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="mb-1 text-sm font-semibold text-white/80">{msg.subject}</p>
                  <p className="text-sm leading-relaxed text-white/60">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-wide text-white/50">{label}</span>
      {children}
    </label>
  );
}

function InfoCard({ icon: Icon, title, value, accent }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; value: string; accent: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition hover:border-white/20">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1"
        style={{ background: `${accent}15`, borderColor: `${accent}40` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-white/40">{title}</p>
        <p className="text-sm font-medium text-white/85">{value}</p>
      </div>
    </div>
  );
}

function BackdropGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[120px]" />
    </div>
  );
}
