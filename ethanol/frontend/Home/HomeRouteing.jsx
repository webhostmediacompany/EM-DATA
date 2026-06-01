import React from 'react'
import Navbar from '../Home_Page_frontend_style/Navbar'
import Footer from '../Home_Page_frontend_style/Footer'
import Dashboard from '../Home_Page_frontend_style/Dashboard'
import ImageCarousel from '../Homepage_Components/ImageCarousel'
import About from '../Homepage_Components/About'
import Molasses from '../Homepage_Components/Molasses'
// import VideoDashboard from '../components/VideoDashboard'
// import ReadingForm from '../Problemetic/ReadingForm'
import ContactSection from '../components/ContactSection'

function HomeRouteing() {
  return (
    <>
    {/* <div>
      <h1>hello satish home routing page</h1>
    </div> */}
    <Navbar/>
    <ImageCarousel/>
    <Dashboard/>
    {/* <VideoDashboard/> */}
    <Molasses/>
    <About/>
    {/* <ReadingForm/> */}
    {/* <ContactSection/> */}
    <Footer/>
    </>
  )
}

export default HomeRouteing
