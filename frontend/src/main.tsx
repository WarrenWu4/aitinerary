import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import Home from "./pages/Home";
import TripTable from "./pages/TripTable";
import TripView from "./pages/TripView"
import TripEdit from "./pages/TripEdit";

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<Home />} />

      <Route path="/trips/:uid" element={<TripTable />} />
      <Route path="/trips/:uid/:tripid" element={<TripView />} />
      <Route path="/trips/:uid/:tripid/edit" element={<TripEdit/>} />

      <Route path="/scrapbooks/:uid" element={<Home />} />
      <Route path="/scrapbooks/:uid/:tripid" element={<Home />} />

      <Route path="/login" element={<Home />} />

      <Route path="*" element={<Home />} />
    </Routes>
  </BrowserRouter>
);
