import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const success = onLogin({ username: username.trim(), password });
    if (!success) {
      setError("Invalid username or password. Try one of the demo credentials.");
      return;
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white border border-slate-200 shadow-2xl p-10">
          <div className="text-center">
            <div className="text-3xl font-semibold text-slate-900">Meeting Optimizer</div>
            <p className="mt-2 text-sm text-slate-500">Sign in with demo credentials to manage meetings and tasks.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            {error ? <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <button type="submit" className="w-full rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">
              Sign in
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] bg-white border border-slate-200 shadow-2xl p-10">
            <div className="text-lg font-semibold text-slate-900">Demo Accounts</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="font-semibold text-slate-900">John Doe</div>
                <div className="mt-1 text-sm text-slate-600">Team Member</div>
                <div className="mt-2 text-xs text-slate-500">john / password123</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="font-semibold text-slate-900">Sarah Johnson</div>
                <div className="mt-1 text-sm text-slate-600">Team Lead</div>
                <div className="mt-2 text-xs text-slate-500">sarah / password123</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="font-semibold text-slate-900">Michael Brown</div>
                <div className="mt-1 text-sm text-slate-600">Project Lead</div>
                <div className="mt-2 text-xs text-slate-500">michael / admin123</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
