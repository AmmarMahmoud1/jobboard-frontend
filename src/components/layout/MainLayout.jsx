import { Outlet } from "react-router-dom";
import NavBar from "../common/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-app-bg">
      <NavBar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;