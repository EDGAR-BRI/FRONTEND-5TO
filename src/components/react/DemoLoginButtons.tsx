import { useState } from 'react'
import { adminLogin, doctorLogin, receptionistLogin, patientLogin } from '@/lib/services/auth/auth.service'
import { FaSpinner } from 'react-icons/fa6'

interface DemoLoginButtonProps {
  role: 'admin' | 'doctor' | 'receptionist' | 'patient'
  label: string
}

export function DemoLoginButton({ role, label }: DemoLoginButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      let redirectPath = ''
      switch (role) {
        case 'admin':
          redirectPath = await adminLogin()
          break
        case 'doctor':
          redirectPath = await doctorLogin()
          break
        case 'receptionist':
          redirectPath = await receptionistLogin()
          break
        case 'patient':
          redirectPath = await patientLogin()
          break
      }
      window.location.href = redirectPath
    } catch (err: any) {
      alert('Error al iniciar sesión demo: ' + (err.message || 'Error desconocido'))
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center text-primary-600 font-semibold text-sm hover:gap-2 transition-all hover:underline disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <FaSpinner className="w-3 h-3 animate-spin" />
          Ingresando...
        </span>
      ) : (
        <>
          {label} <span className="ml-1">→</span>
        </>
      )}
    </button>
  )
}
