import React from 'react'
import proofArcadeLogoIcon from '../assets/proofarcade-logo.png'
import proofArcadeLogoFull from '../assets/proofarcade-logo-navbar.png'

type LogoProps = {
    size?: number
    className?: string
    showText?: boolean
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = '', showText = true }) => {
    // When showText is true, use the full logo with text baked into the image
    // When showText is false, use just the icon
    const logoSrc = showText ? proofArcadeLogoFull : proofArcadeLogoIcon
    
    return (
        <div className={`flex items-center ${className}`}>
            <img
                src={logoSrc}
                alt="ProofArcade"
                width={showText ? size * 4.2 : size}
                height={size}
                className="h-auto min-h-[28px] max-h-[72px] w-auto flex-shrink-0 object-contain"
            />
        </div>
    )
}

export default Logo
