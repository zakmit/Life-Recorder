import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuthSession } from '#/auth/useAuthSession'
import type { ClientSession } from '#/auth/useAuthSession'
import {
  fetchPreferences,
  initializePreferencesIfAbsent,
  savePreferences,
} from './preferences-client'
import {
  readLocalPreferences,
  writeLocalPreferences,
} from './local-preferences'
import { DEFAULT_FORM, preferencesFormSchema } from './preferences-schema'
import type { PreferencesForm } from './preferences-schema'

type PreferenceStatus =
  | 'pending'
  | 'anonymous'
  | 'authenticated'
  | 'session-error'
  | 'error'

type PreferencesContextValue = {
  preferences: PreferencesForm
  status: PreferenceStatus
  signedIn: boolean
  user: NonNullable<ClientSession>['user'] | undefined
  error: Error | null
  save: (values: PreferencesForm) => Promise<void>
  retry: () => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function form(values: unknown): PreferencesForm {
  const parsed = preferencesFormSchema.safeParse(values)
  return parsed.success ? parsed.data : { ...DEFAULT_FORM }
}

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = useAuthSession()
  const { error: authError, isPending, retry: retryAuth, session } = auth
  const [preferences, setPreferences] = useState<PreferencesForm>(DEFAULT_FORM)
  const [status, setStatus] = useState<PreferenceStatus>('pending')
  const [error, setError] = useState<Error | null>(null)
  const generation = useRef(0)
  const owner = useRef<string | null>(null)
  const saveQueue = useRef(Promise.resolve())

  const reconcile = useCallback(async () => {
    const current = ++generation.current
    setError(null)

    if (isPending) {
      setStatus('pending')
      return
    }
    if (authError) {
      owner.current = null
      setStatus('session-error')
      setError(authError)
      return
    }
    if (!session?.user) {
      owner.current = null
      setPreferences(readLocalPreferences())
      setStatus('anonymous')
      return
    }

    owner.current = null
    setPreferences({ ...DEFAULT_FORM })
    setStatus('pending')
    try {
      const lookup = await fetchPreferences()
      const canonical = lookup.present
        ? form(lookup.preferences)
        : form(await initializePreferencesIfAbsent(readLocalPreferences()))
      if (current !== generation.current) return
      setPreferences(canonical)
      writeLocalPreferences(canonical)
      owner.current = session.user.id
      setStatus('authenticated')
    } catch (cause) {
      if (current !== generation.current) return
      setError(
        cause instanceof Error ? cause : new Error('Preference sync failed'),
      )
      setStatus('error')
    }
  }, [authError, isPending, session?.user?.id])

  useEffect(() => {
    void reconcile()
    return () => {
      generation.current += 1
    }
  }, [reconcile])

  const save = useCallback(
    (values: PreferencesForm) => {
      const next = form(values)
      const queuedGeneration = generation.current
      const queuedUserId = session?.user?.id ?? null
      const operation = saveQueue.current.then(async () => {
        if (queuedGeneration !== generation.current) {
          throw new Error('Session changed before preferences were saved')
        }
        setError(null)
        if (status === 'anonymous' && queuedUserId === null) {
          writeLocalPreferences(next)
          setPreferences(next)
          setStatus('anonymous')
          return
        }
        if (queuedUserId === null || owner.current !== queuedUserId) {
          throw new Error('Preferences are not ready to save')
        }
        const saved = form(await savePreferences(next))
        if (queuedGeneration !== generation.current) {
          throw new Error('Session changed while preferences were saving')
        }
        writeLocalPreferences(saved)
        setPreferences(saved)
        setStatus('authenticated')
      })
      saveQueue.current = operation.catch(() => undefined)
      return operation.catch((cause) => {
        const nextError =
          cause instanceof Error ? cause : new Error('Preference save failed')
        if (queuedGeneration === generation.current) {
          setError(nextError)
          setStatus(queuedUserId === null ? 'session-error' : 'error')
        }
        throw nextError
      })
    },
    [session?.user?.id, status],
  )

  const retry = useCallback(() => {
    if (authError) retryAuth()
    else void reconcile()
  }, [authError, reconcile, retryAuth])

  const value = useMemo<PreferencesContextValue>(() => {
    const verifiedUser = status === 'session-error' ? undefined : session?.user
    return {
      preferences,
      status,
      signedIn: !!verifiedUser,
      user: verifiedUser,
      error,
      save,
      retry,
    }
  }, [error, preferences, retry, save, session?.user, status])

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value)
    throw new Error('usePreferences must be used within PreferencesProvider')
  return value
}
