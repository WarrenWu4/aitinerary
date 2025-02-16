import { EventData } from "../types";
import { IconBaseProps } from "react-icons";
import { dateToTime } from "../lib/dateFormatter";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { eventToIcon } from "../pages/TripView";

interface ScheduleViewProps {
    events?: EventData[];
}

export default function ScheduleView( {events}: ScheduleViewProps ) {

    const [openPopup, setOpenPopup] = useState<boolean>(false);
    const [popupEvent, setPopupEvent] = useState<EventData | null>(null);
    
    if (events === null || events === undefined || events.length === 0) {
        return (
            <div className="mt-4 py-2">
                <div>
                    Select a date to view events
                </div>
            </div>
        )
    }

    function handleCardClick(event: EventData) {
        setPopupEvent(event);
        setOpenPopup(true);
    }

    return (
        <div className="flex flex-col gap-y-4 mt-4">
            {events && events.map((event, idx) => {

                console.log(event);
                // const Icon:React.ComponentType<IconBaseProps> = event.type.icon;
                let isCurrentEvent = false;
                if (event.startTime && event.endTime) {
                    isCurrentEvent = event.startTime <= new Date() && event.endTime >= new Date();
                }

                return (
                    <button 
                        type="button" 
                        onClick={() => handleCardClick(event)} 
                        key={idx} 
                        className={`${isCurrentEvent ? "bg-gray-100" : ""} rounded-md p-2 h-full flex gap-x-4 items-center py-2`}
                    > 
                        <div className={`p-2 rounded-full ${event.type.color}`}>
                            {eventToIcon[event.type.icon]}
                        </div>
                        <div>
                            <p className="text-left">
                                {event.title}
                            </p>
                            <div>
                                {event.startTime && dateToTime(event.startTime)} - {event.endTime && dateToTime(event.endTime)}
                            </div>
                        </div>
                    </button>
                )
            })}

            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-md bg-white border-2 border-black ${openPopup ? "flex" : "hidden"}`}>
                <div className="w-full gap-x-8 flex items-center justify-between">
                    <h3 className="font-bold">{popupEvent && popupEvent.title}</h3>
                    <button className="cursor-pointer" type="button" onClick={() => setOpenPopup(false)}>
                        <FaTimes/>
                    </button>
                </div>
            </div>
        </div>
    )
}
