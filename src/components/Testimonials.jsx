import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

// PLACEHOLDER CONTENT — replace with real client/user feedback before treating
// this as genuine social proof. Avatars are generated illustrations (DiceBear),
// not photos of real people, since none were provided.
const REVIEWS = [
  {
    name: 'Grace Nakimuli',
    role: 'SACCO Group Treasurer',
    quote:
      'Managing contributions used to mean a notebook and a lot of trust. Now everyone can see the numbers for themselves.',
    seed: 'Grace-Nakimuli',
  },
  {
    name: 'Peter Okello',
    role: 'Retail Shop Owner',
    quote:
      'The AI advisor caught a stock problem I would have only noticed after losing sales. That alone paid for itself.',
    seed: 'Peter-Okello',
  },
  {
    name: 'Sarah Namutebi',
    role: 'S5 Student',
    quote:
      "I study on the bus now. It just picks up where I left off, even when I lose signal halfway through a lesson.",
    seed: 'Sarah-Namutebi',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-ivory-dim px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-2xl"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">People using it</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-ink">
            What it's actually like on the other end.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-panel-light rounded-xl p-6 flex flex-col"
            >
              <Quote className="text-terracotta/40 mb-3" size={22} />
              <p className="text-sm text-ink/75 leading-relaxed flex-1">"{r.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${r.seed}&backgroundColor=transparent`}
                  alt=""
                  className="w-10 h-10 rounded-full bg-ink/5"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-ink/50">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
