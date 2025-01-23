import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function ScrollAreaC({ servicesNames }: { servicesNames: string[] }) {
  return (
    <ScrollArea className="h-[335px] w-[95%] ml-[15px] rounded-md border">
      <div className="p-8">
        {servicesNames.map((service, index) => (
          <>
            <div key={index} className="text-xl">
              {service}
            </div>
            <Separator className="my-2" />
          </>
        ))}
      </div>
    </ScrollArea>
  );
}
