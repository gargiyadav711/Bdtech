import { useEffect, useState } from "react";
import "./App.css";

import LandingPage from "./LandingPage.jsx";
import Welcome from "./Components/welcome.jsx";
import ForgotPassword from "./Components/ForgotPassword.jsx";
import CreateProject from "./Components/createproject.jsx";
import MentorDashboard from "./mentor/MentorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";

function App() {
  const getRoute = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (path === "/login" || hash === "#login") return "login";
    if (path === "/forgot" || hash === "#forgot") return "forgot";
    if (path === "/mentor" || hash === "#mentor") return "mentor";
    if (path === "/student" || path === "/student/dashboard") return "student";
    if (path === "/createproject" || hash === "#createproject") return "createproject";

    if (
      path === "/register" ||
      hash === "#register" ||
      hash === "#signup"
    ) {
      return "register";
    }

    return "landing";
  };

  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleLocationChange = () => setRoute(getRoute());

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  if (route === "login") return <Welcome />;
  if (route === "register") return <Welcome initialMode="signup" />;
  if (route === "forgot") return <ForgotPassword />;
  if (route === "createproject") return <CreateProject />;
  if (route === "mentor") return <MentorDashboard />;
  if (route === "student") return <StudentDashboard />;

  return <LandingPage />;
}

export default App;
