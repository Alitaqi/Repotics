import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed"; // <-- import Feed

export default function App() {
  return (
    <>
      <BrowserRouter>
        <nav>
          <Link to="/">Home</Link> | <Link to="/feed">Feed</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
