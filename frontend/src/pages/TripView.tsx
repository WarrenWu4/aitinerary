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
import { IoAirplane } from "react-icons/io5";
import { FaCarSide, FaCheck, FaTimes } from "react-icons/fa";
import { FaShoppingBag } from "react-icons/fa";
import { FaTv } from "react-icons/fa";
import { MdLocalDining } from "react-icons/md";

export const eventToIcon = {
    "IoAirplane": <IoAirplane />,
    "FaCarSide": <FaCarSide />,
    "FaCheck": <FaCheck />,
    "FaTimes": <FaTimes />,
    "FaShoppingBag": <FaShoppingBag />,
    "FaTv": <FaTv />,
    "MdLocalDining": <MdLocalDining />,
}

export default function TripTable() {

    const {uid, tripid} = useParams();

    const [tripData, setTripData] = useState<TripData | null>(null);
    const [nextEvent, setNextEvent] = useState<EventData | null>(null);
    const [activeDate, setActiveDate] = useState<Date | null>(null);

    useEffect(() => {

        async function fetchData() {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/trip/${tripid}/${uid}`);
            const data = await res.json();
            console.log(data);
            const existingTrip = {
                metadata: {
                    tripid: tripid,
                    name: data.title,
                    start: new Date(data.start_date),
                    end: new Date(data.end_date),
                    destination: data.destination,
                    collaborators: data.collaborators,
                },
                events: [],
            };
            for (let i = 0; i < data.activities.length; i++) {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/activity/${data.activities[i]}`);
                const activityData = await res.json();
                console.log(activityData);
                const event = {
                    type: {
                        icon: activityData.icon,
                        color: activityData.color,
                    },
                    title: activityData.title,
                    description: activityData.description,
                    startTime: new Date(activityData.start_time),
                    endTime: new Date(activityData.end_time),
                    people: activityData.people,
                };
                existingTrip.events.push(event);
            }
            setTripData(existingTrip);
            const nE = getNextEvent(existingTrip.events || []);
            setNextEvent(nE);
        }

        fetchData();

    }, [])

    return (
        <PageContainer>
            <Navbar/>

            <div className="mt-8">
                <div className="w-full flex items-center justify-between">
                    <h1 className="font-bold text-4xl font-alex">{tripData?.metadata.name}</h1>
                    <NavLink className={`px-4 py-2 rounded-md bg-black text-white font-semibold`} to={`/trips/${uid}/${tripid}/edit`}>
                        Edit Trip
                    </NavLink>
                </div>
                <div className="mt-4 w-fit h-full rounded-md border-2 p-4">
                    <p className="font-bold mb-2">Up Next: </p> 
                    {
                        nextEvent ? 
                    <div className="flex gap-x-4 items-center py-2 border-t-2 border-black/40"> 
                        <div className={`p-2 rounded-full ${nextEvent?.type.color}`}>
                            {eventToIcon[nextEvent.type.icon]}
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
            </div>

            <div className="flex gap-x-4 mt-6 h-full">
                <div className="rounded-md border-2 p-4">
                    <h3 className="font-bold">Calendar</h3>
                    {tripData && tripData.metadata.start && tripData.metadata.end && <Calendar startDate={tripData.metadata.start} endDate={tripData.metadata.end} activeDate={activeDate} setActiveDate={setActiveDate}/>}
                </div>
                <div className="grid grid-place-items-center min-h-full ">
                    <FaArrowRightLong className="my-auto" />
                </div>
                <div className="min-w-80 rounded-md border-2 p-4 min-h-full">
                    <h3 className="font-bold">Schedule</h3>
                    <ScheduleView
                        events={getEventsOnDate(tripData?.events, activeDate)}
                    />
                </div>
            </div>
        </PageContainer>
    )
}
