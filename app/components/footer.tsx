import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#ebf5ee] border-t border-white mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 text-center text-[#000000] text-sm">
        <p>© 2025 LinkTree. All rights reserved.</p>
        {/* <Link 
          href="/Support" 
          className="inline-block mt-2 hover:text-[#01d49f] hover:underline transition-colors"
        >
          Contact Us
        </Link> */}
      </div>
    </footer>
  );
}