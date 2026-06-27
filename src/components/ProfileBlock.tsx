export type ProfileUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

export type ProfileBlockProps = {
  user: ProfileUser | null | undefined
}

const STRANGER_AVATAR = '/img/stranger.png'

/**
 * Burger-menu profile block, mirroring the legacy `.profileContainer` markup:
 * a round 41px avatar on the left, stacked identity text on the right.
 * - Signed out: the stranger.png avatar + "Hello," / "Stranger."
 * - Signed in: the user's avatar + display name + email.
 */
export function ProfileBlock({ user }: ProfileBlockProps) {
  const avatar = user?.image || STRANGER_AVATAR

  return (
    <div className="flex flex-row items-center" style={{ fontWeight: 300 }}>
      <div className="mr-5 flex h-[41px] flex-col justify-center">
        <img
          src={avatar}
          alt="profile"
          onError={(e) => {
            // Fall back to the stranger avatar if the user image fails.
            if (e.currentTarget.src !== STRANGER_AVATAR)
              e.currentTarget.src = STRANGER_AVATAR
          }}
          style={{
            maxWidth: 41,
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            margin: 'auto',
            borderRadius: '50%',
          }}
        />
      </div>
      <div className="flex flex-col">
        {user ? (
          <>
            <span style={{ fontSize: '0.6em' }}>
              {user.name || 'Friend'}
            </span>
            <span style={{ fontWeight: 400, fontSize: '0.4em' }}>
              {user.email}
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '0.5em' }}>Hello,</span>
            <span style={{ fontSize: '0.5em' }}>Stranger.</span>
          </>
        )}
      </div>
    </div>
  )
}
