"use client";
import React, { FC, ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquaredButton } from "@/components/ui/SquaredButton";
import { useEffect, useState } from "react";
import { Services } from "@/app/create/_lib/types";

interface GridDataProps {
  data: () => Promise<Services[]>;
}

const GridServices: FC<GridDataProps> = ({
  data,
}: GridDataProps): ReactElement => {
  const [services, setServices] = useState<Services[]>([]);
  const pathname = usePathname();
  const isAction = pathname === "/create/action/choose";
  const refPath = isAction
    ? "/create/action/choose/list"
    : "/create/reaction/choose/list";

  useEffect(() => {
    async function fetchServices() {
      const fetchedServices = await data();
      setServices(fetchedServices);
    }

    fetchServices();
  }, [data]);

  return (
    <div className="flex flex-wrap justify-center items-center rounded-none">
      {services.map((service, index) => {
        const formattedName = service.serviceName
          .split("_")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ");
        return (
          <Link
            key={index}
            href={{
              pathname: refPath,
              query: {
                serviceName: service.serviceName,
                serviceUrl: service.connectionLink,
                serviceColor: service.colorConf,
                index,
                auth: service.authType,
              },
            }}
          >
            <SquaredButton
              className="w-[250px] h-[250px] flex flex-col items-center justify-center"
              style={{
                backgroundColor: service.colorConf,
                borderRadius: 0,
              }}
            >
              {/* {service.imageConf && (
              <img src={service.imageConf} className="mb-2 w-12 h-12" />
            )} */}
              <span className="text-white font-bold text-xl">
                {formattedName}
              </span>
            </SquaredButton>
          </Link>
        );
      })}
    </div>
  );
};

export default GridServices;
