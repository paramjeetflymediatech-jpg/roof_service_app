import Image from 'next/image';

export default function Logo({ className = "w-10 h-10" }) {
    return (
        <Image
            src="/assets/roofing-logo.png"
            alt="Mainstreet Roofing Logo"
            width={96}
            height={96}
            priority
            className={`${className} object-contain`}
        />
    );
}
