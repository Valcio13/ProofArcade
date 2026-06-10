import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import React from 'react'
import Logo from './Logo'
import { clearStoredWalletAuth, loadStoredWalletAuth } from '../lib/walletAuth'

const Navbar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const pathname = location.pathname
    const isPlayRoute = pathname === '/play' || pathname === '/playtest'
    const [storedWallet, setStoredWallet] = React.useState(() => loadStoredWalletAuth())
    const hasLocalSession = !!storedWallet?.address
    const isAuthRoute = pathname === '/auth'

    React.useEffect(() => {
        setStoredWallet(loadStoredWalletAuth())
    }, [pathname])

    const handleLogout = () => {
        clearStoredWalletAuth()
        setStoredWallet(null)
        setIsMobileMenuOpen(false)
        navigate('/')
    }

    const navItems = [
        {
            label: 'Home',
            path: '/',
            active: pathname === '/' || pathname === '/play' || pathname === '/playtest',
            requiresSession: false,
        },
        {
            label: 'Leaderboard',
            path: '/leaderboard',
            active: pathname === '/leaderboard',
            requiresSession: false,
        },
        {
            label: 'Check-In',
            path: '/check-in',
            active: pathname === '/check-in' || pathname === '/daily-login',
            requiresSession: true,
        },
        {
            label: 'Profile',
            path: '/profile',
            active: pathname === '/profile' || pathname === '/settings',
            requiresSession: true,
        },
        {
            label: 'Shop',
            path: '/shop',
            active: pathname === '/shop',
            requiresSession: true,
        },
        {
            label: 'Explorer',
            path: '/explorer',
            active: pathname.startsWith('/explorer') || pathname.startsWith('/block') || pathname.startsWith('/transaction') || pathname.startsWith('/validator') || pathname.startsWith('/account') || pathname.startsWith('/search'),
            requiresSession: false,
        },
    ].filter(item => hasLocalSession || !item.requiresSession)

    if (isPlayRoute) {
        return null
    }

    return (
        <nav className="bg-navbar shadow-lg">
            <div className="flex items-center justify-between h-20 px-6 lg:px-8">
                {/* LEFT: Logo */}
                <Link to="/" className="flex-shrink-0">
                    <Logo size={32} showText={true} />
                </Link>

                {/* RIGHT: Navigation + Auth Button grouped together */}
                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                                item.active
                                    ? 'text-[#4ade80]'
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {/* Extra spacing before logout */}
                    <div className="w-2" />

                    {hasLocalSession ? (
                        <button
                            onClick={handleLogout}
                            className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                        >
                            Log Out
                        </button>
                    ) : (
                        <Link
                            to="/auth"
                            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
                                isAuthRoute
                                    ? 'bg-[#4ade80] text-[#0a0e1a]'
                                    : 'bg-[#f0cf52] text-[#2f2418] hover:brightness-105'
                            }`}
                        >
                            Log In
                        </Link>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-300 hover:text-primary focus:outline-none focus:text-primary"
                    >
                        <motion.svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </motion.svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-white/10">
                    <div className="px-4 pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`block w-full rounded-xl px-4 py-3 text-left text-base font-semibold ${
                                    item.active
                                        ? 'bg-[#4ade80]/20 text-[#4ade80]'
                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Mobile Auth Button */}
                        <div className="pt-2">
                            {hasLocalSession ? (
                                <button
                                    onClick={handleLogout}
                                    className="block w-full rounded-xl px-4 py-3 text-left text-base font-semibold text-gray-300 hover:text-white hover:bg-white/5"
                                >
                                    Log Out
                                </button>
                            ) : (
                                <Link
                                    to="/auth"
                                    className={`block w-full rounded-xl px-4 py-3 text-left text-base font-semibold ${
                                        isAuthRoute
                                            ? 'bg-[#4ade80]/20 text-[#4ade80]'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
