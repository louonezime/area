import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
} from "@nextui-org/react";
import { isErrorWithResponse, post } from "@/utils/requests";
import { SuccessResponse } from "@/app/create/_lib/types";

interface ServiceAuthProps {
  serviceName: string | null;
  onSuccess: () => void;
}

export type ModalFormHandle = {
  openModal: () => void;
};

export const ModalForm = forwardRef<ModalFormHandle, ServiceAuthProps>(
  ({ serviceName, onSuccess }, ref) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [apiKey, setApiKey] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any | null>(null);

    useImperativeHandle(ref, () => ({
      openModal: onOpen,
    }));

    const handleSubmit = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await post<SuccessResponse>(
          `/service/${serviceName}/add-api-key`,
          { apiKey },
        );

        if (response.data.success) {
          onOpenChange();
          onSuccess(); // TODO toast success
        }
      } catch (err) {
        if (isErrorWithResponse(err)) {
          const errorMessage =
            err.response && err.response.data && err.response.data.message
              ? err.response.data.message
              : "An unexpected error occurred";
          setError(errorMessage || "An error occurred");
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        title={`Connect to ${serviceName}`}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent
          style={{
            maxWidth: "400px",
            padding: "20px",
            backgroundColor: "#282c34",
            color: "#ffffff",
          }} // TODO to check to adapt to css
        >
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {`Add API Key for ${serviceName}`}
              </ModalHeader>
              <ModalBody>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <p className="text-sm font-medium mb-1">API Key</p>
                  <Input
                    placeholder="Enter your API Key"
                    required={true}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    fullWidth
                    style={{ backgroundColor: "#ffffff", color: "#000000" }} // TODO to check
                  />
                  {error && <p className="text-red-500">{error}</p>}
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={loading}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  },
);

ModalForm.displayName = "ModalForm";
