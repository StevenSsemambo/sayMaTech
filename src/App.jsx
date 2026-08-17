import Nav from './components/Nav'
import Hero from './components/Hero'
import DualPath from './components/DualPath'
import KitengeDivider from './components/KitengeDivider'
import Products from './components/Products'
import Process from './components/Process'
import About from './components/About'
import VisionMission from './components/VisionMission'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AskSayMyTech from './components/AskSayMyTech'

export default function App() {
  return (
    <div className="min-h-screen bg-ivory">
      <Nav />
      <Hero />
      <DualPath />
      <KitengeDivider color="#0B1F1A" bg="#F1E9D8" flip />
      <Products />
      <Process />
      <About />
      <VisionMission />
      <KitengeDivider color="#E8622C" bg="#FDF8F0" />
      <Contact />
      <Footer />
      <AskSayMyTech />
    </div>
  )
}
