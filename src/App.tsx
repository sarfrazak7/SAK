import { useRouter } from '@/lib/router';
import Navbar from '@/components/Navbar';
import ViewCounter from '@/components/ViewCounter';
import LandingPage from '@/pages/LandingPage';
import CrosswordPage from '@/pages/CrosswordPage';
import PanagramPage from '@/pages/PanagramPage';
import TableTennisPage from '@/pages/TableTennisPage';
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
      page = <PanagramPage />;
      break;
    case 'tabletennis':
      page = <TableTennisPage />;
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
  const showNavbar = route !== 'tabletennis' && route !== 'panagram';

  return (
    <div className="min-h-screen bg-black">
      {showNavbar && <Navbar current={route} onNavigate={navigate} />}
      {page}
      {showFooter && (
        <footer className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
          <ViewCounter />
        </footer>
      )}
      {showNavbar && !showFooter && (
        <footer className="flex justify-center pb-6">
          <ViewCounter />
        </footer>
      )}
    </div>
  );
}
