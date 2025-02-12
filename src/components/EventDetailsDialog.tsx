import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import EventDetailsForm from "./EventDetailsForm";

interface EventDetailsDialogProps {
  emergencyId: string;
  latitude: number;
  longitude: number;
}

const EventDetailsDialog = ({
  emergencyId,
  latitude,
  longitude,
}: EventDetailsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Описание события</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Детальное описание события</DialogTitle>
        </DialogHeader>
        <EventDetailsForm
          emergencyId={emergencyId}
          latitude={latitude}
          longitude={longitude}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
