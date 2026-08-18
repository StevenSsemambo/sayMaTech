import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import StatsStrip from '../components/StatsStrip'
import DualPath from '../components/DualPath'
import KitengeDivider from '../components/KitengeDivider'
import Products from '../components/Products'
import AppShowcase from '../components/AppShowcase'
import Testimonials from '../components/Testimonials'
import VisionMission from '../components/VisionMission'
import CtaBanner from '../components/CtaBanner'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <StatsStrip />
      <DualPath />
      <KitengeDivider color="#0B1F1A" bg="#F1E9D8" flip />
      <Products limit={6} />
      <AppShowcase />
      <Testimonials />
      <VisionMission />
      <CtaBanner />
    </>
  )
}
