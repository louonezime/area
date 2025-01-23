"use client";
import { Input, Space } from "antd";
import type { GetProps } from "antd";
import axios from "axios";
import { get } from "@/utils/requests";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import GridServices from "@/components/GridServices";
import { ServiceResponse, Services } from "../../_lib/types";

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;
const onSearch: SearchProps["onSearch"] = (value, _e, info) =>
  console.log(info?.source, value);

async function getServicesListReaction(): Promise<Services[]> {
  try {
    const response = await get<ServiceResponse[]>(
      "/service/list?redirect=http://localhost:8081/create/review",
    );
    const servicesData: Services[] = response.data
      .filter((service) => service.reactions.length > 0)
      .map((service, index) => ({
        serviceName: service.name,
        connectionLink: service.auth.url,
        colorConf: service.color,
        imageConf: `image0${index + 1}.png`,
        authType: service.auth.type,
        reactionsTitle: service.actions.map((action) => action.title),
        reactionsDescription: service.actions.map(
          (action) => action.description,
        ),
      }));
    return servicesData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API connection failure -> ", error.message);
    } else {
      console.error("An unexpected error occurred -> ", error);
    }

    return [];
  }
}

export default function ChooseReaction() {
  return (
    <>
      <h1 className="items-center text-5xl ml-[40%] mt-5 mb-[35px] font-bold">
        Choose a service
      </h1>

      <Space direction="vertical" style={{ width: "50%" }}>
        <Search
          placeholder="Search AREAs"
          onSearch={onSearch}
          size="large"
          className="ml-[50%]"
        />

        <Link className="text-xl text-white" href="/create/reaction">
          <RoundedButton className="ml-[210px] px-6 py-7 justify-center text-2xl bg-white text-black dark:text-white border-[5px] border-black">
            <ChevronLeft /> Back
          </RoundedButton>
        </Link>
      </Space>
      {/* <h2 className=" items-center text-xl ml-[46%] mt-10 mb-[20px] font-bold">
        Available services
      </h2> */}
      <div className="justify-center ml-[2%]">
        <GridServices data={getServicesListReaction} />
      </div>
    </>
  );
}
