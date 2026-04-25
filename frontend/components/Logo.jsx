// import logo from "../../public/roofing-logo.png";


export default function Logo({ className = "w-10 h-10" }) {
    return (
        <img
            src="/assets/roofing-logo.png"
            alt="Roofing Logo"
            className={className}
        />
    );
}
