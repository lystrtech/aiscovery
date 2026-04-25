import { logoutAction } from '@/app/login/actions';

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
        Logout
      </button>
    </form>
  );
}
