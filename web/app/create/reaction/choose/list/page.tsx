"use client";
import GridReactions from "@/components/GridReaction";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { get } from "@/utils/requests";
import { ReactionResponse } from "./_lib/types";

async function getReactions(
  serviceName: string,
  authType: string | null,
): Promise<ReactionResponse> {
  const response = await get<ReactionResponse>(
    `/service/${serviceName}/reactions`,
  );
  const reactionsWithArrayForm = response.data.reactions.map((reaction) => ({
    ...reaction,
    auth: authType,
    form: Array.isArray(reaction.form)
      ? reaction.form
      : JSON.parse(reaction.form),
  }));

  return { reactions: reactionsWithArrayForm };
}

export default function GetRectionsList() {
  const [reactions, setreaction] = useState<ReactionResponse | null>(null);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [serviceUrl, setServiceUrl] = useState<string | null>(null);
  const [serviceColor, setServiceColor] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const serviceName = queryParams.get("serviceName");
    const serviceUrl = queryParams.get("serviceUrl");
    const serviceColor = queryParams.get("serviceColor");
    const authType = queryParams.get("auth");

    setServiceName(serviceName);
    setServiceUrl(serviceUrl);
    setServiceColor(serviceColor);

    async function fetchReactions() {
      if (serviceName) {
        try {
          const response = await getReactions(serviceName, authType);
          setreaction(response);
        } catch (error) {
          console.error("Failed to fetch reaction", error);
        }
      }
    }
    fetchReactions();
  }, []);

  if (!reactions || !Array.isArray(reactions.reactions) || Array.length === 0) {
    return (
      <>
        <div className="flex mt-[15%] justify-center items-center text-4xl text-gray-500">
          {" "}
          No {serviceName} reaction available :/{" "}
        </div>
        <div>
          <Link href="/create/reaction/choose">
            <RoundedButton className="flex items-center mt-10 ml-[47%] px-6 py-7 justify-center text-2xl bg-white text-black border-[5px] border-black">
              <ChevronLeft /> Back
            </RoundedButton>
          </Link>
        </div>
      </>
    );
  }

  const reactionsData = reactions.reactions.map((reaction) => ({
    serviceName: serviceName || "",
    serviceOAuthUrl: serviceUrl || "",
    auth: reaction.auth,
    color: serviceColor || "",
    title: reaction.title,
    name: reaction.name,
    description: reaction.description,
    form: reaction.form,
  }));

  const formattedName = serviceName
    ?.split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <>
      <div
        className="flex justify-center items-center p-[215px] w-full text-4xl font-bold mb-10 text-white dark:text-black"
        style={{ backgroundColor: serviceColor || "" }}
      >
        {formattedName || "Unavailable service name."}
      </div>
      <GridReactions data={reactionsData} />
      <div className="absolute mt-[-655px]">
        <Link href="/create/reaction/choose">
          <RoundedButton className="ml-[210px] px-6 py-7 justify-center text-2xl bg-white text-black dark:text-white border-[5px] border-black">
            <ChevronLeft /> Back
          </RoundedButton>
        </Link>
      </div>
    </>
  );
}
