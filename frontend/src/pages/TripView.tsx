import PageContainer from "../components/PageContainer"
import Navbar from "../components/Navbar"
import Calendar from "../components/Calendar";
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { TripData, EventData, EventTypes} from "../types";
import { FaArrowRightLong } from "react-icons/fa6";
import ScheduleView from "../components/ScheduleView";
import { NavLink } from "react-router-dom";
import { getNextEvent, getEventsOnDate } from "../lib/filterEvents";
import { dateToTime } from "../lib/dateFormatter";

export default function TripTable() {

    const {uid, tripid} = useParams();
    console.log(uid, tripid);

    const [tripData, setTripData] = useState<TripData | null>(null);
    const [nextEvent, setNextEvent] = useState<EventData | null>(null);
    const [activeDate, setActiveDate] = useState<Date | null>(null);

    useEffect(() => {

        async function fetchData() {
            const data =  {
                metadata: {
                    tripid: "1",
                    name: "New York with the boys",
                    start: new Date("2-17-2025"),
                    end: new Date("2-20-2025"),
                    destination: "New York",
                    collaborators: ["Warren Wu", "Jenny Wu"]
                },
                events: [{
                    type: EventTypes.flight,
                    title: "AUS to NYC Plane Ride",
                    description: "flight from austin to new york",
                    startTime: new Date("2-17-2025"), 
                    endTime: new Date("2-17-2025"), 
                    people: ["Warren Wu"]
                }, {
                    type: EventTypes.drive,
                    title: "NYC to JFK Drive",
                    description: "drive from new york to jfk",
                    startTime: new Date("2-18-2025"), 
                    endTime: new Date("2-18-2025"), 
                    people: ["Warren Wu"]
                }]
            };
            setTripData(data);
            const nE = getNextEvent(data.events || []);
            setNextEvent(nE);
        }

        fetchData();

    }, [])

    return (
        <PageContainer>
            <Navbar/>

            <div className="flex gap-x-8 items-center mt-8">
                <div className="">
                    <h1 className="font-bold text-4xl font-alex">New york with the boys</h1>
                    <div>
                    </div>
                </div>
                <div className="h-full rounded-md border-2 p-4">
                    <p className="font-bold mb-2">Up Next: </p> 
                    {
                        nextEvent ? 
                    <div className="flex gap-x-4 items-center py-2 border-t-2 border-black/40"> 
                        <div className={`p-2 rounded-full ${nextEvent?.type.color}`}>
                            <nextEvent.type.icon/>
                        </div>
                        <div>
                            <p>
                                {nextEvent.title}
                            </p>
                            <div>
                                {nextEvent.startTime && dateToTime(nextEvent.startTime)} - {nextEvent.endTime && dateToTime(nextEvent.endTime)}
                            </div>
                        </div>
                    </div>
                    :
                        <div>
                            <p>
                                No events
                            </p>
                        </div>
                    }
                </div>
                <NavLink to={`/trips/${uid}/${tripid}/edit`}>
                    edit
                </NavLink>
            </div>

            <div className="flex gap-x-4 items-center h-full mt-6">
                <div className="rounded-md border-2 p-4 h-full">
                    <h3 className="font-bold">Calendar</h3>
                    {tripData && tripData.metadata.start && tripData.metadata.end && <Calendar startDate={tripData.metadata.start} endDate={tripData.metadata.end} activeDate={activeDate} setActiveDate={setActiveDate}/>}
                </div>
                <FaArrowRightLong />
                <div className="rounded-md border-2 p-4 h-full">
                    <h3 className="font-bold">Schedule</h3>
                    <ScheduleView
                        events={getEventsOnDate(tripData?.events, activeDate)}
                    />
                </div>
            </div>
        </PageContainer>
    )
}
