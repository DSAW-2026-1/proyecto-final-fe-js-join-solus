import Navbar from './Navbar'

export default function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
