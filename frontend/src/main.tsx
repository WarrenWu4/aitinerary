import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import Home from "./pages/Home";
import TripTable from "./pages/TripTable";
import TripView from "./pages/TripView"
import TripEdit from "./pages/TripEdit";
import SignIn from "./pages/SignIn";
import { AuthProvider } from "./context/AuthContext";
const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Home />} />

        <Route path="/trips/:uid" element={<TripTable />} />
        <Route path="/trips/:uid/:tripid" element={<TripView />} />
        <Route path="/trips/:uid/:tripid/edit" element={<TripEdit/>} />

        <Route path="/scrapbooks/:uid" element={<Home />} />
        <Route path="/scrapbooks/:uid/:tripid" element={<Home />} />

        <Route path="/signin" element={<SignIn />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
