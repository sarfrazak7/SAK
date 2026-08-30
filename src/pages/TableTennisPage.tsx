export default function TableTennisPage() {
  return (
    <div style={{ marginTop: '57px', height: 'calc(100dvh - 57px)', background: '#0b1017' }}>
      <iframe
        src="/pingpong.html"
        title="Table Tennis"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
