import { useRouter } from '@/lib/router';
import Navbar from '@/components/Navbar';
import ViewCounter from '@/components/ViewCounter';
import LandingPage from '@/pages/LandingPage';
import CrosswordPage from '@/pages/CrosswordPage';
import PanagramPage from '@/pages/PanagramPage';
import Crossword3DPage from '@/pages/Crossword3DPage';
import TableTennisPage from '@/pages/TableTennisPage';
import ContactPage from '@/pages/ContactPage';
import FeedbackPage from '@/pages/FeedbackPage';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  const { route, navigate } = useRouter();

  let page: React.ReactNode;
  switch (route) {
    case 'crossword':
      page = <ErrorBoundary key="crossword"><CrosswordPage /></ErrorBoundary>;
      break;
    case 'crossword3d':
      page = <ErrorBoundary key="crossword3d"><Crossword3DPage /></ErrorBoundary>;
      break;
    case 'panagram':
      page = <ErrorBoundary key="panagram"><PanagramPage /></ErrorBoundary>;
      break;
    case 'tabletennis':
      page = <ErrorBoundary key="tabletennis"><TableTennisPage /></ErrorBoundary>;
      break;
    case 'contact':
      page = <ErrorBoundary key="contact"><ContactPage /></ErrorBoundary>;
      break;
    case 'feedback':
      page = <ErrorBoundary key="feedback"><FeedbackPage /></ErrorBoundary>;
      break;
    default:
      page = <LandingPage onNavigate={navigate} />;
  }

  const showFooter = route === 'home';
  const showNavbar = route !== 'tabletennis' && route !== 'panagram' && route !== 'crossword' && route !== 'crossword3d';

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
