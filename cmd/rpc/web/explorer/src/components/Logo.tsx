import React from 'react'
import proofArcadeLogoIcon from '../assets/proofarcade-logo.png'
import proofArcadeLogoFull from '../assets/proofarcade-logo-navbar.png'

type LogoProps = {
    className?: string
    showText?: boolean
    /** Optional size override for special cases. Default is 32px height. */
    size?: number
}

// Standardized logo dimensions
const DEFAULT_LOGO_HEIGHT = 55
const LOGO_ASPECT_RATIO = 4.2 // Width:Height ratio for full logo with text

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size }) => {
    // Use provided size or default
    const height = size ?? DEFAULT_LOGO_HEIGHT
    const width = showText ? height * LOGO_ASPECT_RATIO : height
    
    // When showText is true, use the full logo with text baked into the image
    // When showText is false, use just the icon (square aspect ratio)
    const logoSrc = showText ? proofArcadeLogoFull : proofArcadeLogoIcon
    
    return (
        <div className={`flex items-center ${className}`}>
            <img
                src={logoSrc}
                alt="ProofArcade"
                width={width}
                height={height}
                style={{ height: `${height}px` }}
                className="w-auto flex-shrink-0 object-contain"
            />
        </div>
    )
}

export default Logo
