"use client";
import { SquaredButton } from "@/components/ui/SquaredButton";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import Link from "next/link";
import { get } from "@/utils/requests";
import { Trash2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { handleOAuthRedirection } from "@/utils/oauth";

function CreateContent() {
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

  const searchParams = useSearchParams();
  const search = searchParams.get("code");
  const provider = searchParams.get("provider");
  if (provider && search) handleServicesOauth(provider, search);

  async function handleServicesOauth(provider: string, search: string) {
    try {
      console.log(`Connecting to ${provider}...`);
      const response = await get(
        `/service/${provider}/oauth/callback/code-add?code=${search}&redirect=http://localhost:8081/create/reaction`,
      );
      console.log(response.data);
      console.log("reminder: add a connection success or failure notification");
      console.log(response);
      const oauthCode = response.data;
      return 0;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`${provider} Connection Failure:`, error.message);
      } else {
        console.error(`An unexpected error occurred with ${provider}:`, error);
      }
      return -1;
    }
  }

  const actionChoosedInfos = JSON.parse(
    localStorage.getItem("actionChoosedInfos") || "null",
  );

  const actionFormInput = JSON.parse(
    localStorage.getItem("actionFormInput") || "null",
  );

  function handleActionDeletion() {
    router.push("/create/action/");
    localStorage.removeItem("actionChoosedInfos");
  }

  return (
    <>
      <h1 className="items-center text-5xl ml-[45%] mt-5 mb-24 font-bold">
        Create
      </h1>
      <div className="flex flex-col items-center">
        <p className="items-center text-xl mt-5 mb-7">
          Create your Action-REAction
        </p>

        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <SquaredButton
              disabled
              className="flex flex-col items-center justify-center px-[95px] py-16 text-white text-8xl"
            >
              <span className="text-white text-2xl">
                {actionChoosedInfos.serviceName}
              </span>
              <span className="text-white text-5xl">
                {actionChoosedInfos.title}
              </span>
            </SquaredButton>
          </div>
          <VerticalLine />
          <Link href="/create/reaction/choose">
            <SquaredButton className="items-center justify-center px-[143px] py-16 text-white text-8xl bg-black">
              Then That
            </SquaredButton>
          </Link>
          <div
            className="flex items-center justify-center w-12 h-12 bg-black rounded-full cursor-pointe position: absolute ml-[570px] mt-[15px]"
            onClick={handleActionDeletion}
          >
            <Trash2 size="24" color="white" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function Create() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <ClipLoader color="#404040" loading={true} size={50} />
        </div>
      }
    >
      <CreateContent />
    </Suspense>
  );
}
