import { useEffect, useState } from "react";
import { Boxes, ShieldCheck } from "lucide-react";

const LoadingScreen = ({ label = "Initializing workspace..." }) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 420);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <div className="app-startup" role="status" aria-live="polite" aria-label={label}>
      <div className="app-startup__glow app-startup__glow--one" />
      <div className="app-startup__glow app-startup__glow--two" />
      <div className="app-startup__card">
        <div className="app-startup__brand-mark"><Boxes size={28} strokeWidth={1.8} /></div>
        <div>
          <p className="app-startup__eyebrow">NEXGEN WAREHOUSE</p>
          <h1>Smart Inventory. Faster Operations.</h1>
          <p className="app-startup__status"><span className="app-startup__dot" />{label}</p>
        </div>
        <div className="app-startup__rail" aria-hidden="true" />
        <div className="app-startup__footer"><ShieldCheck size={14} /> Secure enterprise workspace</div>
      </div>
    </div>
  );
};
export default LoadingScreen;
