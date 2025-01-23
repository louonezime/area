"use client";
import React, { useState } from "react";
import { Modal } from "antd";
import { SquaredButton } from "@/components/ui/SquaredButton";
import { RoundedButton } from "@/components/ui/RoundedButton";
import Link from "next/link";

interface ModalButtonProps {
  title: string;
  subTitle: string;
  color: string;
  totu: string[];
}

const RecommandationsModalButton: React.FC<ModalButtonProps> = ({
  title,
  subTitle,
  color,
  totu,
}) => {
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <SquaredButton
        className={`w-40 px-40 mr-5 mb-5 py-48 text-white text-3xl font-bold ${color} shadow-lg`}
        onClick={showModal}
      >
        <span className="block text-center">
          {title.split("\n").map((line, lineIndex) => (
            <span key={lineIndex} className="block">
              {line}
            </span>
          ))}
          <br />
          <span className="text-xl font-normal text-white">{subTitle}</span>
        </span>
      </SquaredButton>
      <Modal
        open={open}
        onCancel={handleCancel}
        border-radius="12px"
        title={
          <span className="font-[font-avenir-next] text-center text-3xl text-black flex flex-cols justify-center items-center mt-16 mb-10">
            {title}
          </span>
        }
        width="70%"
        footer={null}
      >
        <span className="text-gray-600 text-2xl font-[font-avenir-next]">
          {totu.map((line, lineIndex) => (
            <span key={lineIndex} className="justify-center items-center flex">
              {line}
              <br />
            </span>
          ))}
        </span>
        <div className="flex flex-cols justify-center items-center mt-10 mb-16">
          <Link className="text-xl text-white" href="/create/action/">
            <RoundedButton
              className={`px-6 py-7 text-2xl  ${color} text-black font-[font-avenir-next] border-[6px] border-black`}
            >
              Create it now
            </RoundedButton>
          </Link>
        </div>
      </Modal>
    </>
  );
};

export default RecommandationsModalButton;
