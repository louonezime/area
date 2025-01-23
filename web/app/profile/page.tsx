"use client";
import { LogOut } from "lucide-react";
import { get } from "@/utils/requests";
import { UserInfos } from "@/utils/_lib/types";
import { useEffect, useState } from "react";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { useAuth } from "@/app/context/AuthContext";
import { MyService } from "./_lib/types";
import { ScrollAreaC } from "@/components/ScrollAreaC";

async function getProfile() {
  const usersResponse = await get<UserInfos>("/user");
  return usersResponse.data;
}

async function getServices() {
  const myServices = await get<MyService[]>("/service/myList");
  return myServices.data;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserInfos | null>(null);
  const [services, setServices] = useState<MyService[] | null>(null);
  const { handleLogout } = useAuth();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user: UserInfos = await getProfile();
        setProfile(user);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchServices() {
      try {
        const services: MyService[] = await getServices();
        setServices(services);
      } catch (error) {
        console.error("Failed to fetch services", error);
      }
    }

    fetchServices();
  }, []);

  if (!profile || !services) {
    return <></>;
  }

  const servicesNames = [];

  for (let i = 0; i < services.length; i++) {
    servicesNames.push(services[i].name);
  }

  return (
    <>
      <h1 className="text-5xl text-center mt-5 font-bold">Profile</h1>
      <div className="flex mt-20 ml-[250px]">
        <div className="flex flex-col items-center justify-center w-120 h-128 rounded-lg shadow-md mr-5">
          <div className="user-profile-svg mb-5 mt-10 ml-10 mr-10"></div>
          <p className="text-3xl text-center">{profile.name}</p>
          <p className="text-xl text-center text-gray-500 mb-10">
            {profile.email}
          </p>
        </div>
        <div className="flex flex-col w-[810px] mr-10 h-128 rounded-lg shadow-md">
          <p className="text-3xl text-center mt-10 mb-10 justify-center items-center">
            Your active services
          </p>
          <ScrollAreaC servicesNames={servicesNames} />
          <RoundedButton
            className="position: absolute w-[450px] py-12 mt-[510px] ml-[170px] text-black dark:text-white text-4xl font-bold bg-red-300 border-[6px] border-black"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-14 w-14" /> Log Out
          </RoundedButton>
        </div>
      </div>
    </>
  );
}
