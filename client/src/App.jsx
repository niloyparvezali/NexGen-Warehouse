import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Toast from "./components/ui/Toast";

function App() {
  return (
    <BrowserRouter>
      <Toast />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
