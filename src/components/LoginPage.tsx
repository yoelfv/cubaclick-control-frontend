import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { login } from '../api/auth'

interface LoginPageProps {
  onLogin: () => void
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsLoading(true)
      setError(null)

      await login(identifier, password)
      onLogin()
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Cubaclick</h1>
        <p>Control de pedidos</p>

        <form onSubmit={handleSubmit}>
          <label>
            Usuario o correo electrónico
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label>
            Contraseña
            <div className="password-field">
                <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                />

                <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                    showPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                >
                {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
            </div>
          </label>

          {error && <p>{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default LoginPage