import { useLocation } from "react-router-dom";
import "./App.css";
import LandingPage from "./LandingPage.jsx";
import Welcome from "./Components/welcome.jsx";
import ForgotPassword from "./Components/ForgotPassword.jsx";
import Interviewpage from "./Components/Interviewpage.jsx";
import MentorDashboard from "./mentor/MentorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import SocietyApplication from "./pages/student/SocietyApplication.jsx";
import ApplicationTracking from "./pages/student/ApplicationTracking.jsx";
import InterviewDetails from "./pages/student/InterviewDetails.jsx";
import MyTasks from "./pages/student/MyTasks.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";
import StudentSettings from "./pages/student/StudentSettings.jsx";
import AssignedStudents from "./mentor/AssignedStudents";
import StudentDetails from "./mentor/StudentDetails";
import ProjectReview from "./mentor/ProjectReview";
import ProjectDetails from "./mentor/ProjectDetails";
import CreateProject from "./mentor/CreateProject";
import ErrorPage from "./Components/ErrorPage.jsx";
import MentorAttendance from "./mentor/MentorAttendance";
import StudentAttendance from "./pages/student/StudentAttendance.jsx";
import LoadingPage from "./Components/LoadingPage.jsx";
import StudentProjects from "./pages/student/StudentProjects";
import ExaminationManagement from "./mentor/ExaminationManagement";
import AIRecommendation from "./mentor/AIRecommendations";
import ProbationPerformance from "./Components/ProbationPerformance.jsx";
function App() {
  const location = useLocation();

  const getRoute = () => {
    const rawPath = location.pathname.replace(/\/+$/, "") || "/";
    const rawHash = (location.hash || "").replace(/^#\/?/, "").replace(/\/+$/, "");
    const path = rawPath.toLowerCase();
    const hash = rawHash.toLowerCase();
    if (path === "/login" || hash === "login") return "login";
    if (path === "/forgot" || hash === "forgot") return "forgot";

    // Student Details route: /mentor/students/:id or #mentor/students/:id
    if (
      /^\/mentor\/students\/\d+/i.test(path) ||
      /^mentor\/students\/\d+/i.test(hash) ||
      (path.startsWith("/mentor/students/") && path.length > "/mentor/students/".length) ||
      (hash.startsWith("mentor/students/") && hash.length > "mentor/students/".length)
    ) {
      return "studentdetails";
    }
    // Assigned Students list route: /mentor/students or #mentor/students
    if (
      path === "/mentor/students" ||
      hash === "mentor/students"
    ) {
      return "assignedstudents";
    }
    if (path === "/mentor" || hash === "mentor") return "mentor";
    if (
      path === "/student" ||
      path === "/student/dashboard" ||
      hash === "student" ||
      hash === "student/dashboard"
    ) {
      return "student";
    }

    if (path === "/student/apply" || path === "/student/application") {
      return "studentApplication";
    }
    if (
      path === "/student/application-tracking" ||
      hash === "student/application-tracking"
    ) {
      return "applicationTracking";
    }
    if (path === "/student/interview" || hash === "student/interview") {
      return "studentInterview";
    }
    if (path === "/student/tasks" || hash === "student/tasks") {
      return "studentTasks";
    }
    if (path === "/student/profile" || hash === "student/profile") {
      return "studentProfile";
    }
    if (path === "/student/settings" || hash === "student/settings") {
      return "studentSettings";
    }

    if (
      path === "/createproject" ||
      path === "/create-project" ||
      path === "/mentor/projects/create" ||
      hash === "createproject" ||
      hash === "create-project" ||
      hash === "mentor/projects/create"
    ) {
      return "createproject";
    }
    if (path === "/mentor/projects") {
      return "projectReview";
    }
    if (path.startsWith("/mentor/project-review/")) {
      return "projectDetails";
    }
    if (path === "/mentor/attendance") {
      return "mentorAttendance";
    }
    if (
      path === "/mentor/probation-performance" ||
      path === "/probation-performance" ||
      path === "/probationperformance" ||
      hash === "mentor/probation-performance" ||
      hash === "probation-performance" ||
      hash === "probationperformance"
    ) {
      return "probationPerformance";
    }
    if (path === "/student/attendance") {
      return "studentAttendance";
    }
    if (
      path === "/loading" ||
      path === "/loading-page" ||
      hash === "loading" ||
      hash === "loading-page"
    ) {
      return "loading";
    }
    if (path === "/student/projects" || hash === "student/projects") {
      return "studentProjects";
    }
    if(path === "/mentor/examination-management" || hash === "mentor/examination-management") {
      return "examinationManagement";
    }
    if (path === "/mentor/ai-recommendations" || hash === "mentor/ai-recommendations") {
      return "aiRecommendations";
    }
    if (
      path === "/register" ||
      hash === "register" ||
      hash === "signup"
    ) {
      return "register";
    }

    if (
      path === "/error" ||
      path === "/500" ||
      hash === "error" ||
      hash === "500"
    ) {
      return "serverError";
    }

    if (path === "/" && !rawHash) return "landing";
    if (rawHash === "" && path !== "/") return "error";

    if (rawHash) return "error";
    return "landing";
  };

  const route = getRoute();

  if (route === "login") return <Welcome />;

  if (route === "register") {
    return <Welcome initialMode="signup" />;
  }

  if (route === "forgot") return <ForgotPassword />;
  if (route === "interviewpage") return <Interviewpage />;
  if (route === "assigned-students") return <AssignedStudents />;
  if (route === "mentor") return <MentorDashboard />;
  if (route === "assignedstudents") return <AssignedStudents />;
  if (route === "studentdetails") return <StudentDetails />;
  if (route === "student") return <StudentDashboard />;
  if (route === "studentApplication") return <SocietyApplication />;
  if (route === "applicationTracking") return <ApplicationTracking />;
  if (route === "studentInterview") return <InterviewDetails />;
  if (route === "studentTasks") return <MyTasks />;
  if (route === "studentProfile") return <StudentProfile />;
  if (route === "studentSettings") return <StudentSettings />;
  if (route === "projectReview") return <ProjectReview />;
  if (route === "projectDetails") return <ProjectDetails />;
  if (route === "createproject") return <CreateProject />;
  if (route === "serverError") {
    return (
      <ErrorPage
        code="500"
        title="Something went wrong"
        message="An unexpected error occurred. Please retry or go back."
      />
    );
  }
  if (route === "error") return <ErrorPage />;
  if (route === "mentorAttendance") return <MentorAttendance />;
  if (route === "studentAttendance") return <StudentAttendance />;
  if (route === "probationPerformance") return <ProbationPerformance />;
  if (route === "loading") return <LoadingPage />;
  if (route === "studentProjects") return <StudentProjects />;
  if (route === "examinationManagement") return <ExaminationManagement />;
  if (route === "aiRecommendations") return <AIRecommendation />;
  return <LandingPage />;
}

export default App;
