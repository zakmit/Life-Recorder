import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { signIn, signOut } from '#/auth/client'
import { useAuthSession } from '#/auth/useAuthSession'
import { ProfileBlock } from './ProfileBlock'

const PANEL_WIDTH = 300

/**
 * Slide-in burger navigation, replacing the top bar. Native implementation
 * (no react-burger-menu): a fixed burger button opens a left panel with the
 * profile block, links, auth action, and the github footer — mirroring the
 * legacy menu (Menu.jpg) and its `.bm-*` / `.profileContainer` styles.
 */
export function BurgerNav() {
  const [open, setOpen] = useState(false)
  const { session } = useAuthSession()
  const user = session?.user
  const close = () => setOpen(false)

  return (
    <>
      {/* Burger button (legacy .bm-burger-button-normal: 36px, left/top 36). */}
      {!open && (
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="group fixed left-9 top-9 z-30 flex h-6 w-8 flex-col justify-between cursor-pointer"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="block h-0.5 w-full bg-gray-main group-hover:opacity-80" />
          ))}
        </button>
      )}

      {/* Overlay scrim. */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="fixed inset-0 z-40 cursor-default bg-nav-overlay"
        />
      )}

      {/* Slide-in panel. */}
      <nav
        aria-label="Main menu"
        aria-hidden={!open}
        className="fixed left-0 top-0 z-50 h-full overflow-hidden bg-nav-panel transition-transform duration-300"
        style={{
          width: PANEL_WIDTH,
          padding: '2.5em 1.5em 0',
          transform: open ? 'translateX(0)' : `translateX(-${PANEL_WIDTH}px)`,
        }}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="absolute right-5 top-4 h-6 w-6 text-xl leading-none text-gray-main"
        >
          ×
        </button>

        <ProfileBlock user={user} />

        {/* Split line (legacy .splitLine). */}
        <div
          className="my-3"
          style={{
            width: '100%',
            height: 10,
            borderBottom: '1px solid rgba(112, 112, 112, 0.781)',
          }}
        />

        {/* Links (legacy .bm-item: font-size 2em, font-weight 200). */}
        <div
          className="flex flex-col gap-1"
          style={{ fontSize: '2em', fontWeight: 200 }}
        >
          <Link to="/" onClick={close}>
            Home
          </Link>
          <Link to="/settings" onClick={close}>
            Settings
          </Link>
          <Link to="/history" onClick={close}>
            Statistics
          </Link>
          {user ? (
            <button
              type="button"
              className="text-left"
              onClick={() => {
                close()
                void signOut()
              }}
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              className="text-left"
              onClick={() =>
                void signIn.social({ provider: 'google', callbackURL: '/' })
              }
            >
              Sign in
            </button>
          )}
        </div>

        {/* GitHub footer (legacy .githubLink: tiny, bottom). */}
        <div
          className="absolute bottom-5"
          style={{ fontSize: '0.9rem', marginRight: 42 }}
        >
          If you have any suggestion or encounter any problem, feel free to
          submit an issue on{' '}
          <a
            href="https://github.com/zakmit/Life-Recorder"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            github
          </a>
          .
        </div>
      </nav>
    </>
  )
}
