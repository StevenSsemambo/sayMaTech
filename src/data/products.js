export const products = [
  { name: 'EliAi — Elimu Learn', tag: 'Education', category: 'Education', desc: 'Offline-capable learning companion for secondary school students.' },
  { name: 'StudyFellow', tag: 'Education / AI', category: 'Education', desc: 'AI video learning companion that adapts to how students actually learn.' },
  { name: 'YoSacco', tag: 'Finance', category: 'Finance', desc: 'Savings and cooperative group management, built for shared community finance.' },
  { name: 'ProfitMind AI', tag: 'Retail', category: 'Business', desc: 'POS, stock and finance with a rule-based AI advisor for small businesses.' },
  { name: 'SayMyDoc', tag: 'Health', category: 'Health', desc: 'A health companion built for low-connectivity, everyday use.' },
  { name: 'GasWatch Pro', tag: 'IoT', category: 'IoT', desc: 'Real-time LPG monitoring to prevent gas leaks and outages.' },
  { name: 'Leafy', tag: 'Messaging', category: 'Communication', desc: 'A fast, lightweight messaging app built for low-bandwidth conditions.' },
  { name: 'YoSpeech', tag: 'Wellness', category: 'Health', desc: 'Speech coaching for stuttering and confident public speaking.' },
  { name: 'PipStart', tag: 'Finance / Education', category: 'Finance', desc: 'Practical forex education for everyday traders.' },
  { name: 'YoRemind', tag: 'Productivity', category: 'Productivity', desc: 'Category-aware reminders for debts, medicine, meetings, and more.' },
  { name: 'Poultry Farm Manager', tag: 'Agriculture', category: 'Business', desc: 'Offline desktop app for managing a poultry farm end to end.' },
  { name: 'YoTrade', tag: 'Finance', category: 'Finance', desc: 'Track and analyze binary options trading performance.' },
  { name: 'YoEcho', tag: 'AI Companion', category: 'Wellness', desc: 'A reflective AI companion with memory and voice — your wiser self, becoming.' },
]

export const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))]
