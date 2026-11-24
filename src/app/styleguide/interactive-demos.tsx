"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { company } from "@/content/company";
import { toast } from "@/components/vendor/lightswind";
import { SplitText } from "@/components/vendor/reactbits";

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast("Details saved", {
            description: "Your consignment notes were saved.",
            type: "success",
          })
        }
      >
        Preview success
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast("Something went wrong", {
            description: "Check the highlighted fields and retry.",
            type: "destructive",
          })
        }
      >
        Preview error
      </Button>
    </div>
  );
}

export function RevealDemo() {
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-2">
      <SplitText
        tag="p"
        mode="char"
        text={`${company.headquarters.city} ${company.headquarters.state}`}
        onComplete={() => setDone(true)}
        className="font-display text-2xl tracking-tight"
      />
      <p className="label-caps">{done ? "onComplete fired" : "revealing on scroll"}</p>
    </div>
  );
}
