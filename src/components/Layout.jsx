import { useOutlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from './Nav'
import Footer from './Footer'
import AskSayMyTech from './AskSayMyTech'
import ScrollProgress from './ScrollProgress'

export default function Layout() {
  const location = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-ivory">
      <ScrollProgress />
      <Nav />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <AskSayMyTech />
    </div>
  )
}
