import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Activity, Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

type AuthMode = "login" | "register" | "forgot";

type RegisterFormState = {
  name: string;
  age: string;
  gender: "male" | "female" | "other";
  email: string;
  password: string;
  phone: string;
};

export default function LoginPage() {
  const { user, login, register, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotPasswordValue, setForgotPasswordValue] = useState("");
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    name: "",
    age: "",
    gender: "other",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        if (!loginEmail.trim() || !loginPassword.trim()) {
          throw new Error("Please enter both email and password.");
        }
        await login({ email: loginEmail.trim(), password: loginPassword });
        navigate("/dashboard", { replace: true });
      } else if (mode === "register") {
        const ageNum = Number(registerForm.age);
        if (!registerForm.name.trim()) {
          throw new Error("Please enter your full name.");
        }
        if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
          throw new Error("Please enter a valid age between 1 and 120.");
        }
        if (!/^\S+@\S+\.\S+$/.test(registerForm.email.trim())) {
          throw new Error("Please enter a valid email address.");
        }
        if (!registerForm.password.length) {
          throw new Error("Please enter a password.");
        }

        const phoneDigits = registerForm.phone.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
          throw new Error("Phone number must contain exactly 10 digits.");
        }

        await register({
          name: registerForm.name.trim(),
          age: ageNum,
          gender: registerForm.gender,
          email: registerForm.email.trim(),
          password: registerForm.password,
          phone: phoneDigits,
        });
        navigate("/dashboard", { replace: true });
      } else {
        if (!/^\S+@\S+\.\S+$/.test(forgotEmail.trim())) {
          throw new Error("Please enter a valid email address.");
        }
        const phoneDigits = forgotPhone.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
          throw new Error("Phone number must contain exactly 10 digits.");
        }
        if (!forgotPasswordValue.trim()) {
          throw new Error("Please enter your new password.");
        }

        const message = await resetPassword({
          email: forgotEmail.trim(),
          phone: phoneDigits,
          newPassword: forgotPasswordValue,
        });
        setError(message);
        setMode("login");
        setLoginEmail(forgotEmail.trim());
        setForgotPasswordValue("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 space-y-6 border border-border/50">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Secure Access to VitaScanAI</h1>
          <p className="text-sm text-muted-foreground">
            Your reports will be private and linked to your user profile.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
          >
            Register
          </button>
        </div>

        {mode === "login" && (
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                setMode("forgot");
                setError(null);
                setForgotEmail(loginEmail);
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "login" ? (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Email</span>
                <input
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                  autoComplete="email"
                  type="email"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Password</span>
                <input
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  type="password"
                />
              </label>
            </>
          ) : mode === "register" ? (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Full Name</span>
                <input
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                  placeholder="Mayur"
                  autoComplete="name"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Age</span>
                  <input
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, age: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                    placeholder="22"
                    type="number"
                    min={1}
                    max={120}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Phone</span>
                  <input
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                    placeholder="9876543210"
                    autoComplete="tel"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Gender</span>
                <select
                  value={registerForm.gender}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      gender: e.target.value as "male" | "female" | "other",
                    }))
                  }
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Email</span>
                <input
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                  autoComplete="email"
                  type="email"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Password</span>
                <input
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                  placeholder="Choose your password"
                  autoComplete="new-password"
                  type="password"
                />
              </label>
            </>
          ) : (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Registered Email</span>
                <input
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                  autoComplete="email"
                  type="email"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Registered Phone</span>
                <input
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                  placeholder="9876543210"
                  autoComplete="tel"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">New Password</span>
                <input
                  value={forgotPasswordValue}
                  onChange={(e) => setForgotPasswordValue(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  type="password"
                />
              </label>

              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
              >
                Back to login
              </button>
            </>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
              </>
            ) : (
              <>
                {mode === "login" ? (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </>
                ) : mode === "register" ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Create Account
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Reset Password
                  </>
                )}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
