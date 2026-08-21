import { BrowserRouter } from "react-router-dom";
import Toast from "./components/ui/Toast";
import LoadingScreen from "./components/ui/LoadingScreen";
import AppRouter from "./routes/AppRouter";
function App() {
  return <BrowserRouter><LoadingScreen /><Toast /><AppRouter /></BrowserRouter>;
}
export default App;
