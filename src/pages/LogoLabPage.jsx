import FingerprintCircuit from '../components/logo-concepts/FingerprintCircuit'
import QuoteSlash from '../components/logo-concepts/QuoteSlash'
import CompassS from '../components/logo-concepts/CompassS'
import DialogueLoop from '../components/logo-concepts/DialogueLoop'
import OpenKey from '../components/logo-concepts/OpenKey'

const CONCEPTS = [
  {
    id: 'fingerprint',
    name: '1. Fingerprint Circuit',
    idea: '"It\'s Your Tech" — fingerprint ridges rendered as circuit traces. Personalized technology, literally your print on your tech.',
    Icon: FingerprintCircuit,
  },
  {
    id: 'quoteslash',
    name: '2. Quote–Slash Monogram (current)',
    idea: 'A speech bubble tail resolves into a code slash. "Say" becomes "Tech" in one continuous gesture.',
    Icon: QuoteSlash,
  },
  {
    id: 'compass',
    name: '3. Compass-S',
    idea: 'Vision: "software that transforms the world." An S-shaped compass needle, dual-toned — direction and guidance.',
    Icon: CompassS,
  },
  {
    id: 'dialogue',
    name: '4. Dialogue Loop',
    idea: 'Two speech bubbles interlocked into a closed loop — conversation, feedback, back-and-forth with users everywhere.',
    Icon: DialogueLoop,
  },
  {
    id: 'key',
    name: '5. Open Key',
    idea: '"It\'s Your Tech" reframed as access — a key whose teeth are cut in a circuit pattern. Tech that unlocks something for you.',
    Icon: OpenKey,
  },
]

export default function LogoLabPage() {
  return (
    <div className="pt-32 pb-24 px-6 bg-ivory">
      <div className="max-w-6xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-terracotta">Internal — logo concepts</span>
        <h1 className="font-display font-bold text-3xl md:text-4xl mt-3 text-ink">
          Five directions, side by side.
        </h1>
        <p className="mt-3 text-ink/60 max-w-2xl">
          Each shown at favicon size, in a light nav lockup, and on a dark hero-style background so you can judge
          them the way visitors actually will.
        </p>

        <div className="mt-14 flex flex-col gap-16">
          {CONCEPTS.map(({ id, name, idea, Icon }) => (
            <div key={id} className="border-t border-ink/10 pt-10">
              <h2 className="font-display font-bold text-xl text-ink">{name}</h2>
              <p className="mt-1.5 text-sm text-ink/60 max-w-xl">{idea}</p>

              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {/* Favicon scale */}
                <div className="bg-ivory-dim rounded-xl p-6 flex flex-col items-center gap-3">
                  <span className="text-[10px] font-mono text-ink/40 uppercase">Favicon (16–32px)</span>
                  <div className="flex items-end gap-4">
                    <Icon size={32} />
                    <Icon size={16} />
                  </div>
                </div>

                {/* Light nav lockup */}
                <div className="bg-white border border-ink/8 rounded-xl p-6 flex flex-col items-center gap-3">
                  <span className="text-[10px] font-mono text-ink/40 uppercase">Nav lockup (light)</span>
                  <div className="flex items-center gap-2.5">
                    <Icon size={38} />
                    <span className="font-display font-bold text-xl tracking-tight text-ink">
                      SayMy<span className="text-terracotta">Tech</span>
                    </span>
                  </div>
                </div>

                {/* Dark hero lockup */}
                <div className="bg-ink rounded-xl p-6 flex flex-col items-center gap-3">
                  <span className="text-[10px] font-mono text-ivory/40 uppercase">Hero lockup (dark)</span>
                  <div className="flex items-center gap-2.5">
                    <Icon size={44} />
                    <span className="font-display font-bold text-2xl tracking-tight text-ivory">
                      SayMy<span className="text-terracotta-soft">Tech</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
