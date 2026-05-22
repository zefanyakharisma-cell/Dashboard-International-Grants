import { state } from '../../store.js';
import { navigate } from '../router.js';

export function loginView() {
  if (state.user) { setTimeout(() => navigate('admin'), 0); return '<div class="card p-8 text-center">Redirecting…</div>'; }
  return `
    <div class="max-w-md mx-auto card p-6 mt-8">
      <div class="text-center mb-6">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-petra-600 text-white grid place-items-center shadow-soft"><i data-lucide="shield-check"></i></div>
        <h1 class="text-xl font-bold mt-3">Admin Sign In</h1>
        <p class="text-sm text-slate-500">Petra International Office staff only.</p>
      </div>
      <form id="login-form" class="space-y-3">
        <div>
          <label class="text-xs font-semibold text-slate-500">Email</label>
          <input class="input mt-1" name="email" type="email" placeholder="you@petra.ac.id" autocomplete="username" required />
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-500">Password</label>
          <input class="input mt-1" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required />
        </div>
        <button class="btn btn-primary w-full justify-center" type="submit"><i data-lucide="log-in"></i>Sign in</button>
        <p class="text-xs text-slate-500 text-center pt-2">Use the credentials provided by the International Office.</p>
      </form>
    </div>`;
}
