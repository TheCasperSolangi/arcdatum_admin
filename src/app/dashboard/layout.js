import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function DashboardLayout({ children }) {
  return (
    <div className="grid grid-cols-[288px_1fr] h-screen">
      {/* Sidebar */}
      <div className="overflow-y-auto">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col min-h-0">
        <Header />
        <main className="flex-1 p-6  overflow-y-auto bg-black">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}