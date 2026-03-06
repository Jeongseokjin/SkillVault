import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomeContent from './HomeContent'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense>
        <HomeContent />
      </Suspense>
      <Footer />
    </div>
  )
}
