import './globals.css';import Navbar from '../components/Navbar';import Footer from '../components/Footer';
export const metadata={title:'KS Constructions',description:'Construction services, projects and estimates in India'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Navbar/>{children}<Footer/></body></html>}
