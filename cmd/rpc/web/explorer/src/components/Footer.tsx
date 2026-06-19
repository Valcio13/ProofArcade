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
                        <Logo showText={true} />
                        <span className="text-gray-400/50 text-sm">
                            © {new Date().getFullYear()} ProofArcade
                        </span>
                    </div>

                    {/* Right side - Built on Canopy */}
                    <a
                        href="https://www.canopynetwork.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-sm group"
                    >
                        <span>Built on</span>
                        <span className="font-semibold text-white group-hover:text-[#53a6ff] transition-colors">
                            Canopy
                        </span>
                    </a>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <Logo showText={true} />
                    </div>

                    {/* Copyright */}
                    <div className="text-center mb-3">
                        <span className="text-gray-400/50 text-xs">
                            © {new Date().getFullYear()} ProofArcade
                        </span>
                    </div>

                    {/* Built on Canopy */}
                    <div className="text-center">
                        <a
                            href="https://www.canopynetwork.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-xs group"
                        >
                            <span>Built on</span>
                            <span className="font-semibold text-white group-hover:text-[#53a6ff] transition-colors">
                                Canopy
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
