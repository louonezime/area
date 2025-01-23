"use client";

import GridRecommandations from "@/components/GridRecommandations";
import { Input, Space } from "antd";
import type { GetProps } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { handleOAuthRedirection } from "@/utils/oauth";
import { get } from "@/utils/requests";
import GridModal from "@/components/GridArea";
import { recommendations } from "@/utils/style";
import { useAuth } from "../context/AuthContext";
import { AreaComponent } from "./_lib/types";
import { ClipLoader } from "react-spinners";

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;
const onSearch: SearchProps["onSearch"] = (value, _e, info) =>
  console.log(info?.source, value);

function ExploreContent() {
  const [savedAreas, setSavedAreas] = useState<AreaComponent[] | null>(null);
  const { isLogged } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("code");
  const provider = searchParams.get("provider");

  useEffect(() => {
    const checkConnections = async () => {
      if (search && provider && !isLogged) {
        if ((await handleOAuthRedirection(provider, search)) === 0) {
          router.replace("/explore", undefined);
          router.push("/explore");
        }
      }
    };
    checkConnections();
  }, [search, provider, router, isLogged]);

  useEffect(() => {
    const fetchSavedAreas = async () => {
      try {
        if (isLogged) {
          const response = await get<AreaComponent[]>("/area/list");
          setSavedAreas(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch saved areas:", error);
      }
    };

    fetchSavedAreas();
  }, [isLogged]);

  return (
    <>
      <h1 className="items-center text-5xl ml-[45%] mt-5 mb-10 font-bold">
        Explore
      </h1>
      <h2>
        <Space direction="vertical" style={{ width: "50%" }}>
          <Search
            placeholder="Search AREAs"
            onSearch={onSearch}
            size="large"
            className="mb-10 ml-[50%]"
          />
        </Space>
      </h2>
      {savedAreas ? (
        <>
          <p className="items-center text-xl ml-[46%] mt-5 mb-7">Your A-REAs</p>
          <GridModal data={savedAreas} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default function Explore() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <ClipLoader color="#404040" loading={true} size={50} />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
