"use client";

import AuthFormLogin from "@/components/AuthFormLogin";
import { Link } from "@nextui-org/react";

export default function LogIn() {
  return (
    <>
      <Link
        className="logo-black-clear-bg-svg ml-[46%] mt-[-75px] items-center"
        href="/"
      ></Link>
      <h2 className="items-center text-5xl ml-[46%] mt-5 mb-10 font-bold">
        Log in
      </h2>
      <div className="ml-[37%] mr-[37%]">
        <AuthFormLogin />
      </div>
      <div className="mt-8 text-center">
        <p className="text-lg text-black dark:text-white">
          New to AREA?{" "}
          <a href="/auth/signup" className="underline text-black">
            Sign up here.
          </a>
        </p>
      </div>
    </>
  );
}
