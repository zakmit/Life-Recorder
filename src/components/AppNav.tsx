import { Link } from '@tanstack/react-router'
import { signIn, signOut } from '#/auth/client'
import { useAuthSession } from '#/auth/useAuthSession'

/**
 * Top navigation with auth controls. Anonymous visitors get a "Sign in" button;
 * signed-in users see their name, links to history/settings, and "Sign out".
 */
export function AppNav() {
  const { session } = useAuthSession()
  const user = session?.user

  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-semibold">
          Life Recorder
        </Link>
        {user && (
          <>
            <Link to="/history" className="text-sm text-slate-600">
              History
            </Link>
            <Link to="/settings" className="text-sm text-slate-600">
              Settings
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-slate-700">{user.name || user.email}</span>
            <button
              type="button"
              className="rounded bg-slate-200 px-3 py-1"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            type="button"
            className="rounded bg-slate-800 px-3 py-1 text-white"
            onClick={() =>
              void signIn.social({ provider: 'github', callbackURL: '/' })
            }
          >
            Sign in with GitHub
          </button>
        )}
      </div>
    </nav>
  )
}
