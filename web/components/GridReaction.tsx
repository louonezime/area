"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SquaredButton } from "@/components/ui/SquaredButton";
import { splitIntoLines } from "@/utils/style";

export interface ReactionData {
  serviceName: string;
  title: string;
  description: string;
  auth: string | null;
  form: string[];
  serviceOAuthUrl: string;
  color: string;
}

interface ReactionButtonsProps {
  data: ReactionData[];
}

const GridReaction: React.FC<ReactionButtonsProps> = ({ data }) => {
  const [reactionChoosedInfos, setReactionChoosed] =
    useState<ReactionData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedInfo = localStorage.getItem("reactionChoosedInfos");
      if (savedInfo) {
        setReactionChoosed(JSON.parse(savedInfo));
      }
    }
  }, []);

  const saveReactionChoosed = (info: ReactionData) => {
    setReactionChoosed(info);
    localStorage.setItem("reactionChoosedInfos", JSON.stringify(info));
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      {data.map((reaction, index) => (
        <Link
          key={index}
          href={{
            pathname: "/create/reaction/choose/list/connect",
            query: {
              serviceName: reaction.serviceName,
              serviceColor: reaction.color,
              reactionTitle: reaction.title,
              reactionDescription: reaction.description,
              serviceOAuthUrl: reaction.serviceOAuthUrl,
              auth: reaction.auth,
              form: JSON.stringify(reaction.form),
            },
          }}
        >
          <SquaredButton
            onClick={() => saveReactionChoosed(reaction)}
            className="w-[250px] h-[250px] flex flex-col items-center justify-center"
            style={{
              width: "300px",
              height: "300px",
              backgroundColor: reaction.color,
              borderRadius: 10,
            }}
          >
            <span className="text-white font-bold text-2xl">
              {splitIntoLines(reaction.title).map((line, lineIndex) => (
                <span key={lineIndex}>
                  {line}
                  <br />
                </span>
              ))}
              <span className="text-white text-xl font-normal">
                {splitIntoLines(reaction.description).map((line, lineIndex) => (
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

export default GridReaction;
