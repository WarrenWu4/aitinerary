import PageContainer from "../components/PageContainer"
import Navbar from "../components/Navbar"
import Calendar from "../components/Calendar";
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { TripData } from "../types";
import { FaArrowRightLong } from "react-icons/fa6";
import ScheduleView from "../components/ScheduleView";
import { NavLink } from "react-router-dom";

export default function TripTable() {

    const {uid, tripid} = useParams();
    console.log(uid, tripid);

    const [tripData, setTripData] = useState<TripData | null>(null);

    useEffect(() => {

        async function fetchData() {
            console.log(tripData);
            setTripData(null);
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
                    <p className="font-bold">Up Next: </p> 
                </div>
                <NavLink to={`/trips/${uid}/${tripid}/edit`}>
                    edit
                </NavLink>
            </div>

            <div className="flex gap-x-4 items-center h-full mt-6">
                <div className="rounded-md border-2 p-4 h-full">
                    <h3 className="font-bold">Calendar</h3>
                    <Calendar startDate={new Date()} endDate={new Date("2-17-2025")}/>
                </div>
                <FaArrowRightLong />
                <div className="rounded-md border-2 p-4 h-full">
                    <h3 className="font-bold">Schedule</h3>
                    <ScheduleView/>
                </div>
            </div>
        </PageContainer>
    )
}
