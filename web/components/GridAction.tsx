"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SquaredButton } from "@/components/ui/SquaredButton";
import { splitIntoLines } from "@/utils/style";

export interface ActionData {
  serviceName: string;
  title: string;
  name: string;
  description: string;
  auth: string | null;
  form: string[];
  serviceOAuthUrl: string;
  color: string;
}

interface ActionButtonsProps {
  data: ActionData[];
}

const GridAction: React.FC<ActionButtonsProps> = ({ data }) => {
  const [actionChoosedInfos, setActionChoosed] = useState<ActionData | null>(
    null,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedInfo = localStorage.getItem("actionChoosedInfos");
      if (savedInfo) {
        setActionChoosed(JSON.parse(savedInfo));
      }
    }
  }, []);

  const saveActionChoosed = (info: ActionData) => {
    setActionChoosed(info);
    localStorage.setItem("actionChoosedInfos", JSON.stringify(info));
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      {data.map((action, index) => (
        <Link
          key={index}
          href={{
            pathname: "/create/action/choose/list/connect",
            query: {
              serviceName: action.serviceName,
              serviceColor: action.color,
              actionTitle: action.title,
              actionName: action.name,
              actionDescription: action.description,
              serviceOAuthUrl: action.serviceOAuthUrl,
              auth: action.auth,
              form: JSON.stringify(action.form),
            },
          }}
        >
          <SquaredButton
            onClick={() => saveActionChoosed(action)}
            className="w-[250px] h-[250px] flex flex-col items-center justify-center"
            style={{
              width: "300px",
              height: "300px",
              backgroundColor: action.color,
              borderRadius: 10,
            }}
          >
            <span className="text-white font-bold text-2xl">
              {splitIntoLines(action.title).map((line, lineIndex) => (
                <span key={lineIndex}>
                  {line}
                  <br />
                </span>
              ))}
              <br />
              <span className="text-white text-xl font-normal">
                {splitIntoLines(action.description).map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    <br />
                  </span>
                ))}
              </span>
            </span>
          </SquaredButton>
        </Link>
      ))}
    </div>
  );
};

export default GridAction;
