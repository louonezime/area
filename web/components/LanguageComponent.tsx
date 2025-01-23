"use client";
import { useState } from "react";
import { Modal } from "antd";

export const LanguageComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className="w-[100px] h-30 flex items-center uk-flag-icon-svg p-5 mr-3"
        onClick={showModal}
      ></div>
      <>
        <Modal
          open={isModalOpen}
          onCancel={handleCancel}
          style={{ borderRadius: "12px" }}
          title={
            <span className="font-[font-avenir-next] text-center text-xl text-black flex flex-cols ml-10 mt-16 ">
              Coming soon
            </span>
          }
          width="20%"
          footer={null}
        >
          <span className="text-gray-600 text-xl font-[font-avenir-next] flex flex-cols ml-10 ">
            This feature will be available in the next update.
          </span>
          <span className="text-gray-600 text-xl font-[font-avenir-next] flex flex-cols ml-10 mb-10">
            Available on the mobile application.
          </span>
        </Modal>
      </>
    </>
  );
};

export default LanguageComponent;
