"use client";
import React, { useState } from "react";
import { Modal } from "antd";
import { SquaredButton } from "@/components/ui/SquaredButton";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { ActionComponent, ReactionComponent } from "@/app/explore/_lib/types";
import { splitIntoLines } from "@/utils/style";
import { del } from "@/utils/requests";

interface ModalButtonProps {
  title: string;
  color: string;
  areaNb: string;
  action: ActionComponent;
  reaction: ReactionComponent;
  id: number;
}

const AreaModalButton: React.FC<ModalButtonProps> = ({
  title,
  color,
  areaNb,
  action,
  reaction,
  id,
}) => {
  const [open, setOpen] = useState(false);

  const deleteArea = async () => {
    try {
      await del(`/area/${id}`);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };
  return (
    <>
      <SquaredButton
        style={{ backgroundColor: color }}
        className={`w-40 px-40 mr-5 mb-5 py-48 text-white text-3xl font-bold rounded-[12px]`}
        onClick={showModal}
      >
        <span className="block text-center">
          {splitIntoLines(title).map((line, lineIndex) => (
            <span key={lineIndex} className="block">
              {line}
            </span>
          ))}
          <br />
        </span>
      </SquaredButton>
      <Modal
        open={open}
        onCancel={handleCancel}
        border-radius="12px"
        title={
          <span className="font-[font-avenir-next] text-center text-3xl text-black flex flex-cols justify-center items-center mt-16 mb-10">
            {areaNb}
          </span>
        }
        width="70%"
        footer={null}
      >
        <span className="text-gray-600 text-2xl font-[font-avenir-next] flex flex-cols justify-center items-center">
          {title}
        </span>
        {action.payload?.webhook_url ? (
          <span className="text-gray-600 text-2xl font-[font-avenir-next] flex flex-cols justify-center items-center">
            {`Webhook: ${action.payload.webhook_url}`}
          </span>
        ) : (
          <></>
        )}
        <div className="flex flex-cols justify-center items-center mt-10 mb-16">
          <RoundedButton
            onClick={deleteArea}
            className={`px-6 py-7 text-2xl bg-red-500 text-white font-[font-avenir-next] border-[6px] border-black`}
          >
            Delete
          </RoundedButton>
        </div>
      </Modal>
    </>
  );
};

export default AreaModalButton;
