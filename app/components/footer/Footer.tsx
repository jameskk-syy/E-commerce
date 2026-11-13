import Container from "../Container";
import FooterList from "./FooterList";
import Link from "next/link";
import { MdFacebook } from "react-icons/md";
import {
  AiFillInstagram,
  AiFillTwitterCircle,
  AiFillYoutube,
} from "react-icons/ai";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-zinc-200/80 text-zinc-600 text-xs mt-20">
      <Container>
        <div className="flex flex-col md:flex-row justify-between pt-14 pb-10 gap-10">
          <FooterList>
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-950 mb-3">
              Shop Categories
            </h3>
            <Link href="/?category=Phone" className="hover:text-zinc-950 transition">Phones</Link>
            <Link href="/?category=Laptop" className="hover:text-zinc-950 transition">Laptops</Link>
            <Link href="/?category=Desktop" className="hover:text-zinc-950 transition">Desktops</Link>
            <Link href="/?category=Watch" className="hover:text-zinc-950 transition">Smart Watches</Link>
            <Link href="/?category=Tv" className="hover:text-zinc-950 transition">TVs</Link>
            <Link href="/?category=Accessories" className="hover:text-zinc-950 transition">Accessories</Link>
          </FooterList>

          <FooterList>
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-950 mb-3">
              Customer Services
            </h3>
            <Link href="#" className="hover:text-zinc-950 transition">Track Your Order</Link>
            <Link href="#" className="hover:text-zinc-950 transition">M-Pesa Payment Support</Link>
            <Link href="#" className="hover:text-zinc-950 transition">Shipping & Delivery</Link>
            <Link href="#" className="hover:text-zinc-950 transition">Warranty & Returns</Link>
            <Link href="#" className="hover:text-zinc-950 transition">FAQs</Link>
          </FooterList>

          <div className="w-full md:w-1/3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-950 mb-3">
              About TechHub
            </h3>
            <p className="text-zinc-500 leading-relaxed mb-4">
              TechHub is Kenya&apos;s premier curated marketplace for authentic smartphones, high-performance workspace equipment, and electronics with instant Safaricom M-Pesa STK verification.
            </p>
            <p className="text-zinc-400 text-[11px]">
              &copy; {new Date().getFullYear()} TechHub Inc. All rights reserved.
            </p>
          </div>

          <FooterList>
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-950 mb-3">
              Connect With Us
            </h3>
            <div className="flex items-center gap-3 text-zinc-700">
              <Link href="#" className="hover:text-zinc-950 transition">
                <MdFacebook size={22} />
              </Link>
              <Link href="#" className="hover:text-zinc-950 transition">
                <AiFillTwitterCircle size={22} />
              </Link>
              <Link href="#" className="hover:text-zinc-950 transition">
                <AiFillYoutube size={22} />
              </Link>
              <Link href="#" className="hover:text-zinc-950 transition">
                <AiFillInstagram size={22} />
              </Link>
            </div>
          </FooterList>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
