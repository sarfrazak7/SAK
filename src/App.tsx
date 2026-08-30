import { useRouter } from '@/lib/router';
import Navbar from '@/components/Navbar';
import ViewCounter from '@/components/ViewCounter';
import LandingPage from '@/pages/LandingPage';
import CrosswordPage from '@/pages/CrosswordPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import ContactPage from '@/pages/ContactPage';
import FeedbackPage from '@/pages/FeedbackPage';

export default function App() {
  const { route, navigate } = useRouter();

  let page: React.ReactNode;
  switch (route) {
    case 'crossword':
      page = <CrosswordPage />;
      break;
    case 'panagram':
      page = (
        <PlaceholderPage
          title="Panagram"
          subtitle="Rearrange letters to uncover every hidden word from a pangram. AI generates fresh letter sets every round."
          img="https://images.pexels.com/photos/8762806/pexels-photo-8762806.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          accent="#22c55e"
          onNavigate={navigate}
        />
      );
      break;
    case 'tabletennis':
      page = (
        <PlaceholderPage
          title="Table Tennis"
          subtitle="A fast-paced reflex rally against smart AI opponents that adapt to your play style in real time."
          img="https://images.pexels.com/photos/13793163/pexels-photo-13793163.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          accent="#ef4444"
          onNavigate={navigate}
        />
      );
      break;
    case 'contact':
      page = <ContactPage />;
      break;
    case 'feedback':
      page = <FeedbackPage />;
      break;
    default:
      page = <LandingPage onNavigate={navigate} />;
  }

  const showFooter = route === 'home';

  return (
    <div className="min-h-screen bg-black">
      <Navbar current={route} onNavigate={navigate} />
      {page}
      {showFooter && (
        <footer className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
          <ViewCounter />
        </footer>
      )}
      {!showFooter && (
        <footer className="flex justify-center pb-6">
          <ViewCounter />
        </footer>
      )}
    </div>
  );
}
