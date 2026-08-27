import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Stethoscope, Store, Wallet, TrendingUp, Sparkles, Flame } from 'lucide-react'

const APPS = [
  {
    id: 'eliai',
    name: 'EliAi — Elimu Learn',
    tag: 'Education',
    color: '#1B6B4A',
    icon: BookOpen,
    screens: [
      { src: '/images/screenshots/eliai-splash.jpg', label: 'Welcome' },
      { src: '/images/screenshots/eliai-home.jpg', label: 'Student dashboard' },
      { src: '/images/screenshots/eliai-subjects.jpg', label: 'Subjects & review' },
    ],
  },
  {
    id: 'saymydoc',
    name: 'SayMyDoc',
    tag: 'Health',
    color: '#1B6B4A',
    icon: Stethoscope,
    screens: [
      { src: '/images/screenshots/saymydoc-home.jpg', label: 'Home' },
      { src: '/images/screenshots/saymydoc-chat.jpg', label: 'AI health companion' },
      { src: '/images/screenshots/saymydoc-tools.jpg', label: 'Offline health tools' },
    ],
  },
  {
    id: 'profitmind',
    name: 'ProfitMind AI',
    tag: 'Retail',
    color: '#F2B705',
    icon: Store,
    screens: [
      { src: '/images/screenshots/profitmind-splash.jpg', label: 'Welcome' },
      { src: '/images/screenshots/profitmind-advisor.jpg', label: 'AI advisor briefing' },
      { src: '/images/screenshots/profitmind-charts.jpg', label: 'Sales insights' },
    ],
  },
  {
    id: 'yosacco',
    name: 'YoSacco',
    tag: 'Finance',
    color: '#E8622C',
    icon: Wallet,
    screens: [
      { src: '/images/screenshots/yosacco-home.jpg', label: 'Group dashboard' },
      { src: '/images/screenshots/yosacco-savings.jpg', label: 'Savings history' },
      { src: '/images/screenshots/yosacco-charts.jpg', label: 'Insights' },
    ],
  },
  {
    id: 'yotrade',
    name: 'YoTrade',
    tag: 'Finance',
    color: '#F2B705',
    icon: TrendingUp,
    screens: [
      { src: '/images/screenshots/yotrade-splash.jpg', label: 'Welcome' },
      { src: '/images/screenshots/yotrade-dashboard.jpg', label: 'Performance dashboard' },
      { src: '/images/screenshots/yotrade-log.jpg', label: 'Trade log' },
    ],
  },
  {
    id: 'yoecho',
    name: 'YoEcho',
    tag: 'AI Companion',
    color: '#F2B705',
    icon: Sparkles,
    screens: [
      { src: '/images/screenshots/yoecho-splash.jpg', label: 'Welcome' },
      { src: '/images/screenshots/yoecho-main.jpg', label: 'Daily reflection' },
      { src: '/images/screenshots/yoecho-debates.jpg', label: 'Debate mode' },
    ],
  },
  {
    id: 'gaswatch',
    name: 'GasWatch Pro',
    tag: 'IoT',
    color: '#E8622C',
    icon: Flame,
    screens: [
      { src: '/images/screenshots/gaswatch-dashboard.jpg', label: 'Live dashboard' },
      { src: '/images/screenshots/gaswatch-analytics.jpg', label: 'Weekly analytics' },
      { src: '/images/screenshots/gaswatch-device.jpg', label: 'Device setup' },
    ],
  },
]

export default function AppShowcase() {
  const [active, setActive] = useState(APPS[0].id)
  const [screenIndex, setScreenIndex] = useState(0)
  const activeApp = APPS.find((a) => a.id === active)

  // Reset to first screen whenever the selected app changes
  useEffect(() => {
    setScreenIndex(0)
  }, [active])

  // Auto-cycle through this app's screens
  useEffect(() => {
    const id = setInterval(() => {
      setScreenIndex((i) => (i + 1) % activeApp.screens.length)
    }, 3200)
    return () => clearInterval(id)
  }, [activeApp])

  const currentScreen = activeApp.screens[screenIndex]

  return (
    <section className="bg-ink px-6 py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold">Inside the product</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-ivory">
            Not just a pitch — the real interface.
          </h2>
          <p className="mt-4 text-ivory/60 leading-relaxed max-w-md">
            Actual screens from shipped products. Tap through them.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {APPS.map((app) => {
              const Icon = app.icon
              const isActive = app.id === active
              return (
                <button
                  key={app.id}
                  onClick={() => setActive(app.id)}
                  className={`focus-ring flex items-center gap-2.5 text-left rounded-xl px-3.5 py-2.5 transition-all ${
                    isActive ? 'bg-ivory/10' : 'hover:bg-ivory/5'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isActive ? app.color : 'rgba(253,248,240,0.08)' }}
                  >
                    <Icon size={14} className={isActive ? 'text-ivory' : 'text-ivory/50'} />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-xs font-medium truncate ${isActive ? 'text-ivory' : 'text-ivory/60'}`}>
                      {app.name}
                    </span>
                    <span className="block text-[10px] font-mono text-ivory/30">{app.tag}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Phone frame */}
          <div className="relative w-[280px] h-[560px] bg-[#0a0a0a] rounded-[2.5rem] p-3 shadow-2xl">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0a0a0a] rounded-full z-10" />
            <div className="w-full h-full rounded-[2rem] overflow-hidden bg-ivory relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${active}-${screenIndex}`}
                  src={currentScreen.src}
                  alt={`${activeApp.name} — ${currentScreen.label}`}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Screen dots */}
          <div className="flex gap-1.5 mt-5">
            {activeApp.screens.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setScreenIndex(i)}
                className="focus-ring h-1 rounded-full transition-all"
                style={{
                  width: i === screenIndex ? 24 : 12,
                  backgroundColor: i === screenIndex ? activeApp.color : 'rgba(253,248,240,0.2)',
                }}
                aria-label={s.label}
              />
            ))}
          </div>
          <p className="text-[11px] font-mono text-ivory/40 mt-2">{currentScreen.label}</p>
        </div>
      </div>
    </section>
  )
}
