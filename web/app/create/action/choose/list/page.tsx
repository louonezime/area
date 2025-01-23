"use client";

import GridAction from "@/components/GridAction";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { get } from "@/utils/requests";
import { ActionResponse } from "./_lib/types";

async function getActions(
  serviceName: string,
  authType: string | null,
): Promise<ActionResponse> {
  const response = await get<ActionResponse>(`/service/${serviceName}/actions`);

  const actionsWithArrayForm = response.data.actions.map((action) => ({
    ...action,
    auth: authType,
    form: Array.isArray(action.form) ? action.form : JSON.parse(action.form),
  }));

  return { actions: actionsWithArrayForm };
}

export default function GetActionsList() {
  const [actions, setActions] = useState<ActionResponse | null>(null);
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

    async function fetchActions() {
      if (serviceName) {
        try {
          const response = await getActions(serviceName, authType);
          setActions(response);
        } catch (error) {
          console.error("Failed to fetch actions", error);
        }
      }
    }
    fetchActions();
  }, []);

  if (
    !actions ||
    !Array.isArray(actions.actions) ||
    actions.actions.length === 0
  ) {
    return (
      <>
        <div className="flex mt-[15%] justify-center items-center text-4xl text-gray-500">
          No {serviceName} actions available :/
        </div>
        <div>
          <Link href="/create/action/choose">
            <RoundedButton className="flex items-center mt-10 ml-[47%] px-6 py-7 justify-center text-2xl bg-white text-black dark:text-white border-[5px] border-black">
              <ChevronLeft /> Back
            </RoundedButton>
          </Link>
        </div>
      </>
    );
  }

  const actionsData = actions.actions.map((action) => ({
    serviceName: serviceName || "",
    serviceOAuthUrl: serviceUrl || "",
    auth: action.auth,
    color: serviceColor || "",
    title: action.title,
    name: action.name,
    description: action.description,
    form: action.form,
  }));

  const formattedName = serviceName
    ?.split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <>
      <div
        className="flex justify-center items-center p-[215px] w-full text-4xl font-bold mb-10 text-white"
        style={{ backgroundColor: serviceColor || "" }}
      >
        {formattedName || "Unavailable service name."}
      </div>
      <GridAction data={actionsData} />
      <div className="absolute mt-[-655px]">
        <Link href="/create/action/choose">
          <RoundedButton className="ml-[210px] px-6 py-7 justify-center text-2xl bg-white text-black dark:text-white border-[5px] border-black">
            <ChevronLeft /> Back
          </RoundedButton>
        </Link>
      </div>
    </>
  );
}
