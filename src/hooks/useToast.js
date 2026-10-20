import { useCallback, useState } from 'react'

export function useToast() {
  const [message, setMessage] = useState('')
  const show = useCallback((msg) => setMessage(msg), [])
  const clear = useCallback(() => setMessage(''), [])
  return { message, show, clear }
}
