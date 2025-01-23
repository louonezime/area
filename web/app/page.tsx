"use client";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { Link } from "@nextui-org/react";
import GridRecommandations from "@/components/GridRecommandations";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { recommendations } from "@/utils/style";

export default function Home() {
  const router = useRouter();
  const { isLogged, handleLogout } = useAuth();

  if (isLogged == true) {
    router.push("/explore");
  }
  return (
    <>
      <div className="hidden sm:block">
        <div className="welcome-grey-background-svg bg-cover rounded-[2px] p-64 w-full">
          <Link href="/auth/signup" className="flex gap-10 ml-[35%] mb-[-50%]">
            <RoundedButton className="px-28 py-16 text-black dark:text-white text-4xl font-bold bg-white">
              Start today
            </RoundedButton>
          </Link>
        </div>
        <h1 className="mt-[90px] text-4xl font-bold flex gap-10 justify-center">
          Get started with any AREA
        </h1>
        <div className="mt-[45px] flex gap-10 justify-center mb-20">
          <GridRecommandations data={recommendations} />
        </div>
      </div>

      <div className="block sm:hidden">
        <div className="bg-dark_grey rounded-[2px] p-64 mt-[-12%] w-full relative mb-10">
          <RoundedButton className="ml-[-100px] px-8 py-12 text-black dark:text-white text-2xl font-bold bg-white">
            Start today
            <Link className="text-xl text-black" href="/"></Link>
          </RoundedButton>
        </div>
        <div className="ml-[32%] text-lg font-bold flex justify-center">
          Get started with any AREA
        </div>
        <div className="hidden sm:block">
          <div className="mt-[30px] flex gap-10 justify-center items-center mb-20">
            <GridRecommandations data={recommendations} />
          </div>
        </div>
        <div className="block sm:hidden">
          <div className="mt-[30px] ml-[35%] flex gap-10 justify-center items-center mb-20">
            <GridRecommandations data={recommendations} />
          </div>
        </div>
      </div>
    </>
  );
}
