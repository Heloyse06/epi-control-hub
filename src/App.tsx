import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Lockers from "./pages/Lockers";
import Employees from "./pages/Employees";
import EPIs from "./pages/EPIs";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/armarios" element={<Lockers />} />
        <Route path="/colaboradores" element={<Employees />} />
        <Route path="/epis" element={<EPIs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  </BrowserRouter>
);

export default App;
