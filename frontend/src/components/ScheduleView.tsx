import { useEffect, useState } from "react"
import { EventData, EventTypes } from "../types";
import { IconBaseProps } from "react-icons";
import { dateToTime } from "../lib/dateFormatter";

export default function ScheduleView() {

    const [eventsData, setEventsData] = useState<EventData[] | null>(null);

    useEffect(() => {
       
        async function fetchData() {
            console.log(eventsData);
            setEventsData([{
                type: EventTypes.flight,
                title: "AUS to NYC Plane Ride",
                description: "flight from austin to new york",
                startTime: new Date(), 
                endTime: new Date(), 
                people: ["Warren Wu"]
            }, {
                type: EventTypes.drive,
                title: "NYC to JFK Drive",
                description: "drive from new york to jfk",
                startTime: new Date(), 
                endTime: new Date(), 
                people: ["Warren Wu"]
            }]);
        }

        fetchData();

    }, [])

    return (
        <div className="flex flex-col gap-y-4 mt-4">
            {eventsData && eventsData.map((event, idx) => {

                const Icon:React.ComponentType<IconBaseProps> = event.type.icon;

                return (
                    <div key={idx} className="flex gap-x-4 items-center py-2 border-t-2 border-black/40"> 
                        <div className={`p-2 rounded-full ${event.type.color}`}>
                            <Icon/>
                        </div>
                        <div>
                            <p>
                                {event.title}
                            </p>
                            <div>
                                {dateToTime(event.startTime)} - {dateToTime(event.endTime)}
                            </div>
                        </div>
                        <p className="ml-auto font-bold">
                            {idx+1}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
