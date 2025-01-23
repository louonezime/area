import React from "react";
import { useAuth } from "../app/context/AuthContext";
import RecommendationsModalButton from "@/components/RecommendationsModalButton";

interface areasButtons {
  title: string;
  subTitle: string;
  color: string;
  totu: string[];
}

interface areaButtonsProps {
  data: areasButtons[];
}

const GridRecommandations: React.FC<areaButtonsProps> = ({ data }) => {
  const { isLogged, handleLogout } = useAuth();

  const refPath = isLogged ? "/create/action" : "/auth/login";

  return (
    <div className="flex flex-wrap justify-center items-center">
      {data.map((area, index) => (
        <RecommendationsModalButton
          key={index}
          title={area.title}
          subTitle={area.subTitle}
          color={area.color}
          totu={area.totu}
        />
      ))}
    </div>
  );
};

export default GridRecommandations;
