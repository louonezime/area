import ThemeComponent from "@/components/ThemeComponent";
import LanguageComponent from "@/components/LanguageComponent";
import { Divider } from "antd";

export default function Setting() {
  return (
    <>
      <h1 className="items-center text-5xl ml-[44%] mt-5 mb-16 font-bold">
        Settings
      </h1>
      <div className="!mr-40 !ml-40 flex flex-col w-[800] h-128 rounded-lg shadow-md p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <span className="mt-6 ml-6 !mr-10 text-2xl">Theme</span>
          <ThemeComponent />
        </div>
        <Divider />
        <div className="flex items-center justify-between mb-4">
          <span className="mt-6 ml-6 !mr-10 text-2xl">Language</span>
          <LanguageComponent />
        </div>
      </div>
    </>
  );
}
