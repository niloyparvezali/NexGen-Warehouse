import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Store } from "lucide-react";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { login as loginService } from "../../services/auth.service";
import { useAuth } from "../../context/auth/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await loginService(form);

      login(response.user, response.token);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F172A] p-4 text-[#F8FAFC] sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-[#334155] bg-[#1E293B] shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-[#334155] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.16),transparent_30%),#0F172A] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-[#334155] bg-[#1E293B]/70 px-4 py-3 backdrop-blur-sm">
              <img src="/logo/ng-icon.png" alt="NexGen" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-sm font-semibold tracking-wide text-[#F8FAFC]">NexGen Technology</p>
                <p className="text-xs text-[#64748B]">ERP & POS Management</p>
              </div>
            </div>

            <div className="mt-14 max-w-xl">
              <p className="mb-4 inline-flex items-center rounded-full border border-[#334155] bg-[#1E293B] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#60A5FA]">
                Business workspace
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-[#F8FAFC] xl:text-5xl">
                Run your store from one professional workspace.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#CBD5E1]">
                Manage sales, purchases, inventory, customers, suppliers, payments, reports, and daily operations from a single NexGen system.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#334155] bg-[#1E293B]/80 p-4">
                  <Store size={20} className="text-[#14B8A6]" />
                  <p className="mt-3 text-sm font-semibold text-[#F8FAFC]">POS & Sales</p>
                  <p className="mt-1 text-xs leading-5 text-[#64748B]">Fast checkout and transaction control.</p>
                </div>
                <div className="rounded-2xl border border-[#334155] bg-[#1E293B]/80 p-4">
                  <ShieldCheck size={20} className="text-[#22C55E]" />
                  <p className="mt-3 text-sm font-semibold text-[#F8FAFC]">Operational Control</p>
                  <p className="mt-1 text-xs leading-5 text-[#64748B]">Inventory, reports, and permissions in one place.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            Secure business access
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#1E293B] p-6 sm:p-10 lg:p-12">
          <Card className="w-full max-w-md border border-[#334155] bg-[#1E293B] shadow-none">
            <div className="mb-8 lg:hidden">
              <img src="/logo/ng-full.png" alt="NexGen Technology" className="h-14 w-auto object-contain object-left" />
            </div>

            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#F8FAFC]">Sign in to NexGen</h2>
              <p className="mt-2 text-sm leading-6 text-[#CBD5E1]">Use your business account to continue to the workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />

              {error && (
                <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2.5 text-sm text-[#FCA5A5]">
                  {error}
                </div>
              )}

              <Button type="submit" className="group w-full" disabled={loading}>
                <span>{loading ? "Signing In..." : "Sign In"}</span>
                {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />}
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Login;
