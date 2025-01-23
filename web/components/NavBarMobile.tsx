import React, { useState } from "react";
import { Link } from "@nextui-org/react";
import { AlignJustify } from "lucide-react";

export default function NavBarMobile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const manageSidebar = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav>
      <button
        onClick={manageSidebar}
        className="fixed top-0 ml-[20px] mt-[20px] text-white z-50"
      >
        <AlignJustify size={52} />
      </button>
      <div
        className={`fixed top-0 left-0 h-full w-[250px] bg-gray-900 text-white z-50 transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="mt-[40px] ml-[12px] text-2xl font-semibold mb-[75px]">
            Menu
          </div>
          <div className="ml-[12px]">
            <Link href="/explore" className="text-white text-xl mb-[55px]">
              Explore
            </Link>
          </div>
          <div className="ml-[12px] ">
            <Link
              href="/about/project"
              className="text-white text-xl mb-[55px]"
            >
              About This Project
            </Link>
          </div>
          <div className="ml-[12px]">
            <Link href="/about/us" className="text-white text-xl mb-[55px]">
              About Us
            </Link>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          onClick={manageSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
        ></div>
      )}
    </nav>
  );
}
