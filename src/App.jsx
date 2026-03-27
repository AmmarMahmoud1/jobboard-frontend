import { Routes, Route } from "react-router-dom";
import JobsPage from "./pages/JobsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import PostJobPage from "./pages/PostJobPage";
import EditJobPage from "./pages/EditJobPage";
import MainLayout from "./components/layout/MainLayout";
import PostedJobsPage from "./pages/PostedJobsPage";
import ReceivedApplicationsPage from "./pages/ReceivedApplicationsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<JobsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        <Route path="/edit-job/:id" element={<EditJobPage />} />
        <Route path="/my-jobs" element={<PostedJobsPage />} />
        <Route path="/received-applications" element={<ReceivedApplicationsPage />} />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}

export default App;