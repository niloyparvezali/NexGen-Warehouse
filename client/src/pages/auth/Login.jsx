import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Boxes, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { login as loginService } from "../../services/auth.service";
import { useAuth } from "../../context/auth/useAuth";
const Login = () => {
  const navigate = useNavigate(); const { login } = useAuth();
  const [form,setForm] = useState({email:"",password:""}); const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const [showPassword,setShowPassword]=useState(false);
  const handleChange = (e) => setForm((prev) => ({...prev,[e.target.name]:e.target.value}));
  const handleSubmit = async (e) => { e.preventDefault(); setError(""); if (!form.email.trim() || !form.password) { setError("Enter your business email and password to continue."); return; } setLoading(true); try { const response=await loginService(form); login(response.user,response.token); navigate("/dashboard",{replace:true}); } catch(err) { setError(err.response?.data?.message || "We could not sign you in. Check your credentials and try again."); } finally { setLoading(false); } };
  return <main className="login-page"><div className="login-orbit login-orbit--one"/><div className="login-orbit login-orbit--two"/><div className="login-shell">
    <section className="login-visual"><div className="login-brand"><div className="login-brand__mark"><img src="/logo/ng-icon.png" alt="NexGen"/></div><div><strong>NEXGEN WAREHOUSE</strong><span>Warehouse Management + POS</span></div></div>
      <div className="login-visual__content"><span className="login-kicker">Enterprise operations workspace</span><h1>Move stock. Close sales. Stay in control.</h1><p>One operational system for inventory, purchasing, sales, customers, suppliers, payments and reporting.</p><div className="login-feature-grid"><div><Boxes size={17}/><span><strong>Inventory intelligence</strong><small>Scan stock, movement and low-stock risk.</small></span></div><div><ShieldCheck size={17}/><span><strong>Permission-aware</strong><small>Keep every workflow aligned to user access.</small></span></div></div></div>
      <div className="login-visual__footer"><span className="status-dot"/> Secure business access <span>•</span> Enterprise workspace</div></section>
    <section className="login-form-panel"><div className="login-mobile-brand"><div className="login-brand__mark"><img src="/logo/ng-icon.png" alt="NexGen"/></div><div><strong>NEXGEN</strong><span>Warehouse OS</span></div></div>
      <div className="login-heading"><span>Welcome back</span><h2>Sign in to your workspace</h2><p>Use your NexGen business account to continue.</p></div>
      <form onSubmit={handleSubmit} className="login-form"><div className="login-field-shell"><Mail size={17}/><Input label="Email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} autoComplete="email"/></div><div className="login-field-shell"><LockKeyhole size={17}/><Input label="Password" name="password" type={showPassword?"text":"password"} placeholder="Enter your password" value={form.password} onChange={handleChange} autoComplete="current-password"/><button type="button" className="login-password-toggle" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword((value)=>!value)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>{error&&<div className="login-error" role="alert">{error}</div>}<Button type="submit" className="login-submit" disabled={loading}>{loading?<span className="login-submit__loader"/>:<span>Sign in</span>}{!loading&&<ArrowRight size={17}/>}</Button></form>
      <p className="login-security"><ShieldCheck size={14}/> Your session is protected by NexGen authentication and role-based access control.</p></section>
  </div></main>;
};
export default Login;
