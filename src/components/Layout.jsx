import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import AskSayMyTech from './AskSayMyTech'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-ivory">
      <Nav />
      <Outlet />
      <Footer />
      <AskSayMyTech />
    </div>
  )
}
