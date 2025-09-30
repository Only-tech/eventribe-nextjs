'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type RegistrationStep = 'email' | 'verification' | 'details_password'

export default function IdleHintBubble({ step }: { step: RegistrationStep }) {
  const [visible, setVisible] = useState(false)
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
      setVisible(false) 
    }

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'input', 'focus']
    events.forEach(e => window.addEventListener(e, updateActivity))

    const interval = setInterval(() => {
      const now = Date.now()
      const idleTime = now - lastActivityRef.current

      // Verify if input is in focus
      const activeElement = document.activeElement
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      )

      if (idleTime > 30000 && !visible && !isTyping) {
        setVisible(true)
        setTimeout(() => setVisible(false), 5000)
      }
    }, 30000)

    return () => {
      events.forEach(e => window.removeEventListener(e, updateActivity))
      clearInterval(interval)
    }
  }, [visible])

  const messages: Record<RegistrationStep, string> = {
    email: "Un compte, et tout devient possible !",
    verification: "Encore une étape et c’est parti !",
    details_password: "Bienvenue dans la tribu !"
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="fixed w-full max-w-[85%] top-6 [769px]:top-1 left-1/2 transform -translate-x-1/2 transition-all ease-out py-3 px-5 rounded-lg border border-gray-300 dark:border-white/20 text-center text-sm text-gray-800 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#E8E5D8] dark:bg-black dark:text-white/70 z-50"
        >
          {messages[step]}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
