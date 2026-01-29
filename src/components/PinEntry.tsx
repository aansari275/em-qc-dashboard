import { useState } from 'react'
import { useVerifyPin } from '../hooks/useApi'
import { Loader2, Lock, AlertCircle } from 'lucide-react'

interface PinEntryProps {
  onSuccess: () => void
}

export function PinEntry({ onSuccess }: PinEntryProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const verifyPin = useVerifyPin()

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')

      if (newPin.length === 4) {
        verifyPin.mutate(newPin, {
          onSuccess: () => {
            onSuccess()
          },
          onError: () => {
            setError('Invalid PIN')
            setPin('')
          },
        })
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">QC Dashboard</h1>
          <p className="text-slate-400 text-sm">Enter PIN to continue</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                pin.length > i
                  ? 'bg-emerald-500/20 border-emerald-400'
                  : 'bg-white/5 border-white/20'
              }`}
            >
              {pin.length > i && (
                <div className="w-3 h-3 bg-emerald-400 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm mb-6">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {verifyPin.isPending && (
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((digit, i) => (
            <button
              key={i}
              onClick={() => {
                if (digit === '⌫') {
                  handleBackspace()
                } else if (digit) {
                  handleDigit(digit)
                }
              }}
              disabled={!digit || verifyPin.isPending}
              className={`h-14 rounded-xl font-medium text-xl transition-all duration-150 ${
                digit === ''
                  ? 'cursor-default'
                  : digit === '⌫'
                  ? 'bg-white/5 text-white/70 hover:bg-white/10 active:scale-95'
                  : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {digit}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
