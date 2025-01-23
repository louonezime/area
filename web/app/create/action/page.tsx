"use client";
import { SquaredButton } from "@/components/ui/SquaredButton";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

import Link from "next/link";

export default function Create() {
  const { isLogged } = useAuth();
  const router = useRouter();

  const VerticalLine = () => {
    return (
      <div
        className="vertical-line"
        style={{
          width: "5px",
          height: "70px",
          backgroundColor: "#DCDCDC",
        }}
      ></div>
    );
  };

  if (!isLogged) {
    router.push("/auth/signup");
  }

  return (
    <>
      <h1 className="items-center text-5xl ml-[45%] mt-5 mb-20 font-bold">
        Create
      </h1>
      <div className="flex flex-col items-center">
        <Link className="text-xl text-white" href="/explore">
          <RoundedButton className="ml-[-750px] px-6 py-7 justify-center text-2xl bg-white text-black dark:text-white border-[5px] border-black">
            <ChevronLeft /> Explore
          </RoundedButton>
        </Link>

        <div className="flex flex-col items-center">
          <p className="items-center text-xl mt-[-30px] mb-7 text-gray-400">
            Create your Action-REAction
          </p>
          <Link href="action/choose">
            <SquaredButton className="items-center justify-center px-[137px] py-16 text-white text-8xl bg-black">
              If This
              <div className="items-center justify-center rounded-full ml-[40px] px-[45px] py-4 text-black dark:text-white text-2xl bg-white">
                Add
              </div>
            </SquaredButton>
          </Link>
          <VerticalLine />
          <SquaredButton
            disabled
            className="items-center justify-center px-[143px] py-16 text-white text-8xl bg-black"
          >
            Then That
          </SquaredButton>
        </div>
      </div>
    </>
  );
}
