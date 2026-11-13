import Container from "../Container";
import Link from "next/link";
import CartCount from "./CartCount";
import UserMenu from "./UserMenu";
import { getCurrentUser } from "@/actions/getCurrentUser";
import SearchBar from "./SearchBar";

const Navbar = async () => {
  const currentUser = await getCurrentUser();

  return (
    <header className="sticky top-0 w-full bg-white/85 backdrop-blur-xl z-30 border-b border-zinc-200/80 transition-all">
      <div className="py-3">
        <Container>
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group select-none">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-extrabold text-sm tracking-tighter shadow-sm group-hover:bg-indigo-600 group-hover:scale-105 transition-all duration-200">
                TH
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-zinc-950 leading-tight">
                  tech<span className="text-indigo-600">hub</span>
                </span>
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase -mt-0.5">
                  Kenya
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-zinc-600">
              <Link
                href="/?category=Phone"
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition"
              >
                Smartphones
              </Link>
              <Link
                href="/?category=Laptop"
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition"
              >
                Laptops
              </Link>
              <Link
                href="/?category=Watch"
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition"
              >
                Watches
              </Link>
              <Link
                href="/?category=Accessories"
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 hover:text-zinc-950 transition"
              >
                Accessories
              </Link>
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 justify-center max-w-md mx-2">
              <SearchBar />
            </div>

            {/* Right Controls: Cart & Profile */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {currentUser?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span>Admin Panel</span>
                </Link>
              )}

              <CartCount />
              <UserMenu currentUser={currentUser} />
            </div>
          </div>

          {/* Mobile Search Bar Row */}
          <div className="md:hidden mt-2.5 pt-2 border-t border-zinc-100 flex justify-center">
            <SearchBar />
          </div>
        </Container>
      </div>
    </header>
  );
};

export default Navbar;
