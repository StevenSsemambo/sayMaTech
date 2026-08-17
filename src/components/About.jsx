import { motion } from 'framer-motion'

export default function About() {
  return (
    <section id="about" className="bg-ivory px-6 py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">About</span>
          <h2 className="font-display font-bold text-3xl mt-3 text-ink">Built by someone who builds daily.</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-3 text-ink/70 leading-relaxed space-y-4 text-lg"
        >
          <p>
            SayMyTech Developers was founded by <strong className="text-ink">Ssemambo Steven</strong>, a
            self-taught software builder and Computer Science graduate of Makerere University's
            College of Computing and Informatics Technology, where he now also teaches
            programming as a Lecturing Assistant.
          </p>
          <p>
            Every product carries the same starting question: does this actually work for someone
            on a shared phone, patchy data, and a language that isn't always English-first? That
            African-first lens shapes the architecture before it shapes the interface.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
