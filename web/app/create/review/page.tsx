"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { get, post } from "@/utils/requests";
import axios from "axios";
import { Suspense } from "react";
import { SquaredButton } from "@/components/ui/SquaredButton";
import { Trash2 } from "lucide-react";
import { ClipLoader } from "react-spinners";

interface AreaSubmitResponse {
  id: number;
  name: string;
  userId: number;
  actionId: number;
  reactionId: number;
}

function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("code");
  const provider = searchParams.get("provider");

  if (provider && search) handleServicesOauth(provider, search);

  async function handleServicesOauth(provider: string, search: string) {
    try {
      console.log(`Connecting to ${provider}...`);
      const response = await get(
        `/service/${provider}/oauth/callback/code-add?code=${search}&redirect=http://localhost:8081/create/review`,
      );
      console.log(response.data);
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
  const reactionChoosedInfos = JSON.parse(
    localStorage.getItem("reactionChoosedInfos") || "null",
  );
  const actionFormInput = JSON.parse(
    localStorage.getItem("actionFormInput") || "null",
  );
  const reactionFormInput = JSON.parse(
    localStorage.getItem("reactionFormInput") || "null",
  );

  const finalData = {
    action: {
      name: actionChoosedInfos?.name || "",
      service: actionChoosedInfos?.serviceName || "",
      data: actionFormInput || {},
    },
    reaction: {
      name: reactionChoosedInfos?.name || "",
      service: reactionChoosedInfos?.serviceName || "",
      data: reactionFormInput || {},
    },
  };

  async function handleAreaSubmit() {
    try {
      console.log("Final data -> ", finalData);
      const response = await post<AreaSubmitResponse>("/area", finalData);
      console.log("Response from server -> ", response.data);
      router.push("/explore");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API connection failure ->", error.message);
      } else {
        console.error("An unexpected error occurred ->", error);
      }
      return [];
    }
  }

  const VerticalLine = () => (
    <div
      className="vertical-line"
      style={{
        width: "5px",
        height: "70px",
        backgroundColor: "#DCDCDC",
      }}
    ></div>
  );

  function handleReactionDeletion() {
    router.push("/create/reaction/");
    localStorage.removeItem("reactionChoosedInfos");
  }

  return (
    <>
      <h1 className="items-center text-5xl ml-[43%] mt-5 mb-24 font-bold">
        Your A-REA
      </h1>
      <div className="flex flex-col items-center">
        <p className="items-center text-xl mt-5 mb-7">
          Review on your personalized A-REA
        </p>
        <SquaredButton
          disabled
          className="flex flex-col items-center justify-center px-[95px] py-16 text-white text-8xl"
        >
          <span className="text-white text-2xl">
            {actionChoosedInfos?.serviceName}
          </span>
          <span className="text-white text-5xl">
            {actionChoosedInfos?.title}
          </span>
        </SquaredButton>
        <VerticalLine />
        <SquaredButton
          disabled
          className="flex flex-col items-center justify-center px-[95px] py-16 text-white text-8xl"
        >
          <span className="text-white text-2xl">
            {reactionChoosedInfos?.serviceName}
          </span>
          <span className="text-white text-5xl">
            {reactionChoosedInfos?.title}
          </span>
        </SquaredButton>
        <RoundedButton
          className="bg-gray-400 mt-[60px] text-xl py-[30px] px-[30px]"
          onClick={handleAreaSubmit}
        >
          Save
        </RoundedButton>
      </div>
      <div
        className="flex items-center justify-center w-12 h-12 bg-black rounded-full cursor-pointe position: absolute ml-[1155px] mt-[-225px]"
        onClick={handleReactionDeletion}
      >
        <Trash2 size="24" color="white" />
      </div>
    </>
  );
}

export default function ReviewAREA() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <ClipLoader color="#404040" loading={true} size={50} />
        </div>
      }
    >
      <ReviewPage />
    </Suspense>
  );
}
