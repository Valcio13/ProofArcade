import React from 'react'
import Logo from './Logo'

const Footer: React.FC = () => {
    return (
        <footer className="bg-navbar border-t border-gray-800/60">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                    {/* Left side - Logo and Copyright */}
                    <div className="flex items-center gap-3">
                        <Logo size={250} showText={false} />
                        <span className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} ProofArcade. All rights reserved.
                        </span>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <Logo size={220} showText={false} />
                    </div>

                    {/* Copyright */}
                    <div className="text-center">
                        <span className="text-gray-400 text-xs">
                            © {new Date().getFullYear()} ProofArcade. All rights reserved.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
