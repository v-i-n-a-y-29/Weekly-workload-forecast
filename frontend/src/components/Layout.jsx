import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children, onLogout }) {
  return (
    <div className="min-h-screen">
      <Navbar onLogout={onLogout} />
      <Sidebar />

      <main className="ml-64 mt-16 px-10 py-8">
        {children}
      </main>
    </div>
  );
}