import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
function App() {
  return (
    <>
      <Outlet />
      <Toaster richColors />
    </>
  );
}
export default App;