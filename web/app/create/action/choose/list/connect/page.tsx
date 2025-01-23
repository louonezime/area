"use client";
import { useState, useEffect, ChangeEvent, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RoundedButton } from "@/components/ui/RoundedButton";
import { ChevronLeft } from "lucide-react";
import { HintComponent } from "@/components/HintComponent";
import { ActionData } from "@/components/GridAction";
import { get, post } from "@/utils/requests";
import { ModalForm, ModalFormHandle } from "@/components/ModalForm";
import { SuccessResponse } from "@/app/create/_lib/types";
import { ClipLoader } from "react-spinners";

interface FormField {
  hint: string;
  name: string;
  title?: string;
  value?: string;
}

function ConnectActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("serviceName");
  const serviceColor = searchParams.get("serviceColor");
  const actionTitle = searchParams.get("actionTitle");
  const actionName = searchParams.get("actionName");
  const actionDescription = searchParams.get("actionDescription");
  const serviceOAuthUrl = searchParams.get("serviceOAuthUrl");
  const serviceAuthType = searchParams.get("auth");

  const form = searchParams.get("form");
  const parsedForm: FormField[] = form ? JSON.parse(form) : [];

  const [popup, setPopup] = useState<Window | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [actionFormInput, setActionFormInput] = useState<ActionData | null>(
    null,
  );
  const modalRef = useRef<ModalFormHandle>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(interval);
      } else if (popup && popup.location) {
        try {
          if (
            popup.location.href.includes(
              `http://localhost:8081/create/reaction`,
            )
          ) {
            const location = popup.location.href;
            const code = location.split("code=")[1];
            const parsedCode = code.split("&");
            popup.close();
            clearInterval(interval);
            router.push(
              `/create/reaction?provider=${serviceName}&code=${code}`,
            );
          }
        } catch (error) {
          console.error(error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [popup, router, serviceName]);

  const handleSuccess = () => {
    console.log("API Key added successfully!");
    router.push("/create/reaction");
  };

  const saveFormInput = (info: ActionData) => {
    setActionFormInput(info);
    localStorage.setItem("actionFormInput", JSON.stringify(info));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);
    saveFormInput(updatedFormData as unknown as ActionData);
  };

  async function handleServiceConnection() {
    if (serviceAuthType === "oauth2") {
      const openWindow = window.open(
        serviceOAuthUrl || "",
        "Service Authentication",
        "width=1920,height=1080",
      );

      if (openWindow) {
        setPopup(openWindow);
      }
    } else if (serviceAuthType === "apiKey") {
      try {
        const res = await get<SuccessResponse>(
          `/service/${serviceName}/status`,
        );
        if (res.data.success) {
          router.push("/create/reaction");
        }
      } catch (err) {
        if (modalRef.current) {
          modalRef.current.openModal();
        }
      }
    } else {
      const res = await post<SuccessResponse>(
        `/service/${serviceName}/register-normal`,
        {},
      );
      if (res.data.success) {
        router.push("/create/reaction");
      }
    }
  }

  const formattedName = serviceName
    ?.split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <>
      <div
        className="h-screen overflow-hidden flex justify-center items-center"
        style={{
          backgroundColor: serviceColor || "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <div className="font-bold text-white text-4xl mb-10 mt-[-40%] absolute overflow-hidden">
          {formattedName || "Unavailable service name."}
        </div>

        <div className="text-white text-center text-2xl mt-[-25%] mb-[-15%] absolute overflow-hidden">
          {actionTitle || "Unavailable action data."}
          <br />
          {actionDescription || "Unavailable service description."}
          <form className="mt-7">
            {parsedForm.map((field, idx) => (
              <div key={idx} className="mb-5">
                <label className="block text-lg font-medium mb-1">
                  {field.title || field.name}
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name={field.name}
                    placeholder={`Enter ${field.name}`}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-lg text-black dark:text-white"
                  />
                  {field.hint && (
                    <HintComponent title="Hint" content={field.hint} />
                  )}
                </div>
              </div>
            ))}
          </form>
        </div>
        <div className="mt-[25%]">
          <RoundedButton
            className="px-16 py-12 text-black text-4xl bg-white overflow-hidden"
            onClick={handleServiceConnection}
          >
            Connect
            <ModalForm
              ref={modalRef}
              serviceName={serviceName}
              onSuccess={handleSuccess}
            />
          </RoundedButton>
        </div>
        <div className="absolute mt-[-655px]">
          <Link href="/create/action/choose/">
            <RoundedButton className="ml-[-700px] px-6 py-7 justify-center text-2xl bg-white text-black dark:text-white border-[5px] border-black overflow-hidden">
              <ChevronLeft /> Back
            </RoundedButton>
          </Link>
        </div>
      </div>
    </>
  );
}

export default function ConnectAction() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <ClipLoader color="#404040" loading={true} size={50} />
        </div>
      }
    >
      <ConnectActionContent />
    </Suspense>
  );
}
