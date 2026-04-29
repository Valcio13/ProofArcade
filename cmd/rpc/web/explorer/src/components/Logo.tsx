import React from 'react'
import proofArcadeLogo from '../assets/proofarcade-logo-navbar.png'

type LogoProps = {
    size?: number
    className?: string
    showText?: boolean
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = '', showText = true }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img
                src={proofArcadeLogo}
                alt="ProofArcade"
                width={size * 4.2}
                height={size}
                className="h-auto min-h-[28px] max-h-[72px] w-auto flex-shrink-0 object-contain"
            />
            {showText && (
                <span className="text-white font-semibold text-lg">
                    ProofArcade
                </span>
            )}
        </div>
    )
}

export default Logo
