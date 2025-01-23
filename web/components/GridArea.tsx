"use client";
import React, { useEffect, useState } from "react";
import AreaModalButton from "@/components/AreaModalButton";
import {
  AreaComponent,
  ActionComponent,
  ReactionComponent,
} from "@/app/explore/_lib/types";
import { get } from "@/utils/requests";

interface ServiceInfo {
  id: number;
  name: string;
  color: string;
  state: string;
  type: string;
}

interface areaButtonsProps {
  data: AreaComponent[];
}

const GridModalComponentB: React.FC<areaButtonsProps> = ({ data }) => {
  const [actionData, setActionData] = useState<Record<number, ActionComponent>>(
    {},
  );
  const [reactionData, setReactionData] = useState<
    Record<number, ReactionComponent>
  >({});
  const [actionColors, setActionColors] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const actionPromises = data.map((area) =>
        get<ActionComponent>(`/area/actions/${area.actionId}`)
          .then((res) => res.data)
          .catch(() => null),
      );
      const reactionPromises = data.map((area) =>
        get<ReactionComponent>(`/area/reactions/${area.reactionId}`)
          .then((res) => res.data)
          .catch(() => null),
      );

      const actions = await Promise.all(actionPromises);
      const reactions = await Promise.all(reactionPromises);
      const validActions = actions.filter((action) => action !== null);
      const validReactions = reactions.filter((reaction) => reaction !== null);

      setActionData(
        validActions.reduce(
          (acc, action) => ({ ...acc, [action.id]: action }),
          {},
        ),
      );
      setReactionData(
        validReactions.reduce(
          (acc, reaction) => ({ ...acc, [reaction.id]: reaction }),
          {},
        ),
      );

      const serviceIds = Array.from(new Set(actions.map((a) => a?.serviceId)));
      const servicePromises = serviceIds.map((serviceId) =>
        get<ServiceInfo>(`/service/${serviceId}`).then((res) => res.data),
      );

      const services: ServiceInfo[] = await Promise.all(servicePromises);
      setActionColors(
        services.reduce(
          (acc, service) => ({ ...acc, [service.id]: service.color }),
          {},
        ),
      );
    };

    fetchData();
  }, [data]);

  return (
    <div className="flex flex-wrap justify-center items-center">
      {data.map((area, index) => {
        const action = actionData[area.actionId];
        const reaction = reactionData[area.reactionId];
        if (!action || !reaction) {
          return null;
        }
        const actionColor = actionColors[action.serviceId] || "bg-pink-600";

        return (
          <AreaModalButton
            key={index}
            areaNb={`Area ${index + 1}`}
            title={`If ${action.title} then ${reaction.title}`}
            color={actionColor}
            action={action}
            reaction={reaction}
            id={area.id}
          />
        );
      })}
    </div>
  );
};

export default GridModalComponentB;
