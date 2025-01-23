"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { Cog } from "lucide-react";
import { useAuth } from "../app/context/AuthContext";
import { DropdownComponent } from "./DropdownMenu";

export default function NavBarDesktop({
  colorNavBar,
  textConfig,
  textColor,
  logoConfig,
  settingsColor,
}: {
  colorNavBar: string;
  textConfig: string;
  textColor: string;
  logoConfig: string;
  settingsColor: string;
}) {
  const { isLogged } = useAuth();

  return (
    <Navbar className={colorNavBar}>
      <NavbarBrand>
        <Link href={isLogged ? "/explore" : "/"}>
          <div className={logoConfig}></div>
        </Link>
      </NavbarBrand>
      <NavbarContent className={textConfig}>
        {isLogged ? (
          <NavbarItem>
            <Link href="/explore" className={textColor}>
              Explore
            </Link>
          </NavbarItem>
        ) : (
          <></>
        )}
        <NavbarItem isActive>
          <Link href="/about/project" className={textColor}>
            About This Project
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/about/us" className={textColor}>
            About Us
          </Link>
        </NavbarItem>
        <NavbarContent className="ml-auto flex gap-5 text-xl">
          {isLogged ? (
            <>
              <NavbarItem>
                <RoundedButton className="px-10 py-7 text-xl">
                  <Link className="text-xl text-white" href="/create/action">
                    Create
                  </Link>
                </RoundedButton>
              </NavbarItem>
              <NavbarItem>
                <Link>
                  <DropdownComponent />
                </Link>
              </NavbarItem>
            </>
          ) : (
            <>
              <NavbarItem>
                <RoundedButton className="px-10 py-8 text-xl">
                  <Link className="text-xl text-white" href="/auth/login">
                    Log in
                  </Link>
                </RoundedButton>
              </NavbarItem>
              <NavbarItem>
                <RoundedButton asChild className="px-10 py-8 text-xl bg-white">
                  <Link className="text-xl text-black" href="/auth/signup">
                    Sign Up
                  </Link>
                </RoundedButton>
              </NavbarItem>
            </>
          )}

          <NavbarItem>
            <div className="ml-[-36px] flex justify-end p-4 mr-[-64px] mt-[-87px]">
              <button className="mr-4 px-3 py-2">
                <div className="uk-flag-icon-svg"></div>
              </button>
            </div>
          </NavbarItem>
          <NavbarItem>
            <div className="ml-[-20px] justify-end p-4 mr-[-48px] mt-[-82px]">
              <Link href="/settings">
                <button className="ml-3">
                  <Cog size={33} color={settingsColor} />
                </button>
              </Link>
            </div>
          </NavbarItem>
        </NavbarContent>
      </NavbarContent>
    </Navbar>
  );
}
