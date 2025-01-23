"use client";
import { useState } from "react";
import { FaMoon } from "react-icons/fa";
import { BsSunFill } from "react-icons/bs";
import { Modal } from "antd";

export const ThemeComponent = () => {
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
        className="relative w-20 h-12 flex items-center dark:bg-gray-900 bg-teal-500 cursor-pointer rounded-full p-1"
        onClick={showModal}
      >
        <FaMoon className="text-white" size={18} />
        <div className="absolute bg-white dark:bg-medium w-6 h-6 rounded-full shadow-md transform transition-transform duration-300"></div>
        <BsSunFill className="ml-auto text-yellow-400" size={18} />
      </div>
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

export default ThemeComponent;
