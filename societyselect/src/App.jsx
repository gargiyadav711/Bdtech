
import { useEffect, useState } from "react";
import "./App.css";

import LandingPage from "./LandingPage.jsx";
import Welcome from "./Components/welcome.jsx";
import ForgotPassword from "./Components/ForgotPassword.jsx";

import MentorDashboard from "./mentor/MentorDashboard";
import AssignedStudents from "./mentor/AssignedStudents";

function App() {
  const getRoute = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === "/login" || hash === "#login") return "login";
    if (path === "/forgot" || hash === "#forgot") return "forgot";
    if (
      hash === "#register" ||
      hash === "#signup" ||
      path === "/register"
    ) {
      return "register";
    }

    if (
      path === "/mentor/students" ||
      hash === "#students"
    ) {
      return "students";
    }

    if (path === "/mentor" || hash === "#mentor") return "mentor";

    return "landing";
  };

  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getRoute());
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  if (route === "login") return <Welcome />;

  if (route === "register") {
    return <Welcome initialMode="signup" />;
  }

  if (route === "forgot") return <ForgotPassword />;
  if (route === "students") return <AssignedStudents />;
  if (route === "mentor") return <MentorDashboard />;

  return <LandingPage />;
}

export default App;
