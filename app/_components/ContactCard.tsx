"use client";

import React, { useState } from "react";
import StationsDialog from "./StationsDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";

import type { Purpose, ContactCardProps } from "@/types/contact-card";

export default function CustomerInformation({
  initialLocalPart = "",
  initialPurpose,
  onSubmit,
  className,
}: ContactCardProps) {
  const [localPart, setLocalPart] = useState<string>(initialLocalPart);
  const [purpose, setPurpose] = useState<Purpose | "">(initialPurpose ?? "");
  const [stations, setStations] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null,
  );

  const handleSubmit = () => {
    const email = `${localPart}@neu.edu.ph`;
    if (onSubmit && purpose !== "") onSubmit(email, purpose as Purpose);

    // mock stations data shown after submit
    const mockStations = [
      { id: "s1", name: "Station Alpha" },
      { id: "s2", name: "Station Bravo" },
      { id: "s3", name: "Station Charlie" },
      { id: "s4", name: "Station Delta" },
      { id: "s5", name: "Station Echo" },
    ];

    setStations(mockStations);
    setOpen(true);
  };

  const handlePick = (s: { id: string; name: string }) => {
    setSelected(s);
  };

  return (
    <div className={`${className ?? ""} w-full px-4`}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Provide your NEU email and purpose</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="email-local">Email</Label>
              <div className="mt-1 flex items-center">
                <Input
                  id="email-local"
                  className="flex-1 min-w-0 placeholder:text-muted-foreground/70"
                  placeholder="romnoel.petracorta"
                  value={localPart}
                  onChange={(e) =>
                    setLocalPart(e.target.value.split("@")[0].trim())
                  }
                />
                <div className="ml-2 flex items-center text-sm text-muted-foreground">
                  @neu.edu.ph
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-2">
              <Label>Purpose</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="inline-flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-muted-foreground">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span
                        className={
                          purpose === "" ? "text-muted-foreground" : undefined
                        }>
                        {purpose === "" ? "Select purpose" : purpose}
                      </span>
                    </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-muted-foreground">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Purpose</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={purpose}
                    onValueChange={(v) => setPurpose(v as Purpose)}>
                    <DropdownMenuRadioItem value="payment">
                      Payment
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="clinic">
                      Clinic
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="inquire">
                      Inquire
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="misc">
                      Misc
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={localPart.trim() === "" || purpose === ""}>
              Submit
            </Button>
          </div>
        </CardFooter>
      </Card>

      <StationsDialog
        open={open}
        setOpen={setOpen}
        stations={stations}
        onPick={handlePick}
      />

      {selected && (
        <div className="max-w-md mx-auto mt-3 text-sm text-muted-foreground">
          Selected station: {selected.name}
        </div>
      )}
    </div>
  );
}
