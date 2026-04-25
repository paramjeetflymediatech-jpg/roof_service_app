import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Button({
    children,
    variant = 'primary',
    href,
    onClick,
    type = 'button',
    disabled = false,
    icon,
    className = '',
    ...props
}) {
    const baseClasses = 'btn';

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    const buttonContent = (
        <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </>
    );

    const MotionButton = motion.button;
    const MotionLink = motion.a;

    if (href) {
        return (
            <Link href={href} passHref legacyBehavior>
                <MotionLink
                    className={classes}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    {...props}
                >
                    {buttonContent}
                </MotionLink>
            </Link>
        );
    }

    return (
        <MotionButton
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            {...props}
        >
            {buttonContent}
        </MotionButton>
    );
}
