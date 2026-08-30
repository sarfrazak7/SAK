import BackToHomeButton from '@/components/BackToHomeButton';

export default function TableTennisPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0b1017' }}>
      <iframe
        src="/pingpong.html"
        title="Table Tennis"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="autoplay; fullscreen"
      />
      <BackToHomeButton />
    </div>
  );
}


export default TableTennisPage