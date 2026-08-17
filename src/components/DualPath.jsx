import { motion } from 'framer-motion'
import { Briefcase, Rocket, ArrowUpRight } from 'lucide-react'

export default function DualPath() {
  return (
    <section id="work" className="bg-ivory px-6 py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-ink text-ivory p-10 flex flex-col justify-between min-h-[280px]"
        >
          <div>
            <Briefcase className="text-terracotta mb-6" size={28} />
            <h3 className="font-display font-bold text-2xl mb-3">Hiring a dev partner?</h3>
            <p className="text-ivory/70 leading-relaxed">
              We design and ship custom software — apps, AI features, full systems —
              for businesses that need something that actually works for their users, not just the demo.
            </p>
          </div>
          <a href="#contact" className="focus-ring mt-8 inline-flex items-center gap-1 text-gold font-medium">
            Start a project <ArrowUpRight size={16} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl bg-savanna text-ivory p-10 flex flex-col justify-between min-h-[280px]"
        >
          <div>
            <Rocket className="text-gold mb-6" size={28} />
            <h3 className="font-display font-bold text-2xl mb-3">Looking for an app to use?</h3>
            <p className="text-ivory/70 leading-relaxed">
              Explore our own product line — study tools, finance, health, communication,
              and more — built to solve real problems for real people, wherever they are.
            </p>
          </div>
          <a href="#products" className="focus-ring mt-8 inline-flex items-center gap-1 text-ivory font-medium">
            Browse products <ArrowUpRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
