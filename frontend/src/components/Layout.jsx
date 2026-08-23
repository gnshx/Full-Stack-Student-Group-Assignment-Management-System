import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 ml-60 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
