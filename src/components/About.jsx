import { motion } from 'framer-motion'
import LogoMark from './Logo'

export default function About() {
  return (
    <section id="about" className="bg-ivory px-6 py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="md:col-span-2 relative"
        >
          {/* Ambient glow behind the frame */}
          <div className="absolute -top-8 -left-8 w-48 h-48 bg-terracotta/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -right-4 w-40 h-40 bg-gold/15 rounded-full blur-3xl" />

          <div className="relative rounded-2xl p-[3px] bg-gradient-to-br from-terracotta via-gold to-savanna glow-border">
            <div className="relative rounded-[14px] overflow-hidden bg-ink">
              <img
                src="/images/founder.jpg"
                alt="Ssemambo Steven, Founder of SayMyTech Developers"
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
              {/* Founder badge overlay */}
              <div className="absolute bottom-0 inset-x-0 glass-panel px-4 py-3 flex items-center gap-2.5">
                <LogoMark size={28} />
                <div>
                  <p className="text-ivory font-display font-bold text-sm leading-tight">Ssemambo Steven</p>
                  <p className="text-ivory/60 text-[11px] font-mono uppercase tracking-wide">Founder & Lead Developer</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="md:col-span-3"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">About</span>
          <h2 className="font-display font-bold text-3xl mt-3 text-ink">Built by someone who builds daily.</h2>

          <div className="mt-5 text-ink/70 leading-relaxed space-y-4 text-lg">
            <p>
              SayMyTech Developers was founded by <strong className="text-ink">Ssemambo Steven</strong>, a
              self-taught software builder and Computer Science graduate of Makerere University's
              College of Computing and Informatics Technology.
            </p>
            <p>
              Every product carries the same starting question: does this actually solve the
              problem for the person using it — on their device, their connection, their day?
              That practical lens shapes the architecture before it shapes the interface,
              wherever in the world that person happens to be.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
