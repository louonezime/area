"use client";

import AuthFormSignUp from "@/components/AuthFormSignUp";
import { Link } from "@nextui-org/react";

export default function SignUp() {
  return (
    <>
      <Link
        className="logo-black-clear-bg-svg ml-[46%] mt-[-75px] mb-[-2%] items-center"
        href="/"
      ></Link>
      <h2 className="items-center text-5xl ml-[45%] mt-5 mb-10 font-bold">
        Sign up
      </h2>
      <div className="ml-[37%] mr-[37%]">
        <AuthFormSignUp />
      </div>
      <div className="mt-8 text-center">
        <p className="text-lg text-black">
          Already on AREA?{" "}
          <a
            href="/auth/login"
            className="underline text-black dark:text-white"
          >
            Log in here.
          </a>
        </p>
      </div>
    </>
  );
}
