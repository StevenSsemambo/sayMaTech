import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Wallet, Store, Bell, Signal, Battery, Wifi } from 'lucide-react'

const APPS = [
  {
    id: 'eliai',
    name: 'EliAi — Elimu Learn',
    tag: 'Education',
    color: '#1B6B4A',
    icon: BookOpen,
    frame: 'phone',
  },
  {
    id: 'yosacco',
    name: 'YoSacco',
    tag: 'Finance',
    color: '#E8622C',
    icon: Wallet,
    frame: 'phone',
  },
  {
    id: 'profitmind',
    name: 'ProfitMind AI',
    tag: 'Retail',
    color: '#F2B705',
    icon: Store,
    frame: 'desktop',
  },
]

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-2.5 pb-1 text-[10px] font-mono text-ink/70">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <Signal size={11} />
        <Wifi size={11} />
        <Battery size={12} />
      </div>
    </div>
  )
}

function EliAiScreen() {
  return (
    <div className="h-full flex flex-col bg-ivory">
      <StatusBar />
      <div className="px-4 pt-2 pb-3">
        <p className="text-[10px] text-ink/40 font-mono">Good evening,</p>
        <p className="font-display font-bold text-ink text-base">Sarah</p>
      </div>
      <div className="px-4 space-y-2 flex-1">
        <div className="bg-savanna rounded-xl p-3 text-ivory">
          <p className="text-[10px] font-mono uppercase tracking-wide opacity-70">Continue learning</p>
          <p className="font-semibold text-sm mt-0.5">Biology — Cell Structure</p>
          <div className="mt-2 h-1.5 bg-ivory/25 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full" style={{ width: '64%' }} />
          </div>
        </div>
        {['Chemistry — Bonding', 'Math — Algebra II', 'Physics — Motion'].map((t) => (
          <div key={t} className="bg-white rounded-lg px-3 py-2.5 flex items-center justify-between border border-ink/5">
            <span className="text-xs font-medium text-ink/80">{t}</span>
            <span className="text-[10px] font-mono text-ink/30">→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function YoSaccoScreen() {
  return (
    <div className="h-full flex flex-col bg-ivory">
      <StatusBar />
      <div className="px-4 pt-2 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-ink/40 font-mono">Group balance</p>
          <p className="font-display font-bold text-ink text-xl">UGX 4,820,000</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-terracotta/15 flex items-center justify-center text-terracotta font-bold text-xs">
          UM
        </div>
      </div>
      <div className="px-4 flex gap-2 mb-3">
        <div className="flex-1 bg-terracotta text-ivory rounded-lg py-2 text-center text-xs font-medium">Contribute</div>
        <div className="flex-1 bg-white border border-ink/10 rounded-lg py-2 text-center text-xs font-medium text-ink/70">Request loan</div>
      </div>
      <div className="px-4 space-y-2 flex-1">
        <p className="text-[10px] font-mono uppercase text-ink/40 tracking-wide">Recent activity</p>
        {[
          { n: 'Grace N.', a: '+ 50,000', pos: true },
          { n: 'Loan repayment', a: '- 120,000', pos: false },
          { n: 'Peter K.', a: '+ 75,000', pos: true },
        ].map((r) => (
          <div key={r.n} className="bg-white rounded-lg px-3 py-2.5 flex items-center justify-between border border-ink/5">
            <span className="text-xs font-medium text-ink/80">{r.n}</span>
            <span className={`text-xs font-mono ${r.pos ? 'text-savanna' : 'text-terracotta'}`}>{r.a}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfitMindScreen() {
  const bars = [40, 65, 50, 80, 45, 90, 60]
  return (
    <div className="h-full bg-ivory p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-ink/40 font-mono uppercase tracking-wide">Today's revenue</p>
          <p className="font-display font-bold text-ink text-2xl">UGX 1,240,500</p>
        </div>
        <div className="text-xs font-mono bg-savanna/10 text-savanna px-2.5 py-1 rounded-full">+12.4%</div>
      </div>
      <div className="flex-1 flex items-end gap-2 bg-white rounded-xl p-4 border border-ink/5">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-gold" style={{ height: `${h}%`, opacity: 0.5 + i * 0.07 }} />
        ))}
      </div>
      <div className="mt-4 bg-terracotta/10 rounded-lg p-3 flex items-start gap-2">
        <span className="text-terracotta text-xs mt-0.5">◆</span>
        <p className="text-xs text-ink/70 leading-relaxed">
          <strong className="text-ink">AI advisor:</strong> Cooking oil stock is low — reorder within 3 days
          based on this week's sales pace.
        </p>
      </div>
    </div>
  )
}

const SCREENS = {
  eliai: EliAiScreen,
  yosacco: YoSaccoScreen,
  profitmind: ProfitMindScreen,
}

export default function AppShowcase() {
  const [active, setActive] = useState(APPS[0].id)
  const activeApp = APPS.find((a) => a.id === active)
  const Screen = SCREENS[active]

  return (
    <section className="bg-ink px-6 py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold">Inside the product</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-ivory">
            Not just a pitch — a real interface.
          </h2>
          <p className="mt-4 text-ivory/60 leading-relaxed max-w-md">
            A quick look at how a few of our products actually feel to use. Tap through them.
          </p>

          <div className="mt-8 flex flex-col gap-2">
            {APPS.map((app) => {
              const Icon = app.icon
              const isActive = app.id === active
              return (
                <button
                  key={app.id}
                  onClick={() => setActive(app.id)}
                  className={`focus-ring flex items-center gap-3 text-left rounded-xl px-4 py-3.5 transition-all ${
                    isActive ? 'bg-ivory/10' : 'hover:bg-ivory/5'
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isActive ? app.color : 'rgba(253,248,240,0.08)' }}
                  >
                    <Icon size={16} className={isActive ? 'text-ivory' : 'text-ivory/50'} />
                  </span>
                  <span>
                    <span className={`block text-sm font-medium ${isActive ? 'text-ivory' : 'text-ivory/60'}`}>
                      {app.name}
                    </span>
                    <span className="block text-[11px] font-mono text-ivory/30">{app.tag}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center">
          {/* Phone frame */}
          <div className="relative w-[280px] h-[560px] bg-[#0a0a0a] rounded-[2.5rem] p-3 shadow-2xl">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0a0a0a] rounded-full z-10" />
            <div className="w-full h-full rounded-[2rem] overflow-hidden bg-ivory relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <Screen />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
