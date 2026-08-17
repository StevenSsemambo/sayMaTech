import { motion } from 'framer-motion'
import About from '../components/About'
import VisionMission from '../components/VisionMission'

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink text-ivory px-6 pt-36 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono uppercase tracking-widest text-gold"
          >
            About SayMyTech
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-bold text-4xl md:text-5xl mt-3 max-w-2xl"
          >
            It's Your Tech.
          </motion.h1>
        </div>
      </section>
      <About />
      <VisionMission />
    </>
  )
}
