import { EventData } from "../types";
import { IconBaseProps } from "react-icons";
import { dateToTime } from "../lib/dateFormatter";

interface ScheduleViewProps {
    events?: EventData[];
}

export default function ScheduleView( {events}: ScheduleViewProps ) {
    
    if (events === null || events === undefined) {
        return (
            <div className="mt-4">
                No events
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-4 mt-4">
            {events && events.map((event, idx) => {

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
                                {event.startTime && dateToTime(event.startTime)} - {event.endTime && dateToTime(event.endTime)}
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
