'use client'

import { Toaster } from 'sonner'

export default function Toast() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          borderRadius: '12px',
          border: '1px solid #EBEBEB',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        },
      }}
    />
  )
}
