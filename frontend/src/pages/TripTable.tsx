import PageContainer from "../components/PageContainer";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { TripInfo } from "../types";
import { RiArrowRightUpLine } from "react-icons/ri";
import { NavLink, useParams } from "react-router-dom";
import { startEndDateNicer } from "../lib/dateFormatter";

export default function TripTable() {

    const {uid} = useParams();
    const [tripsData, setTripsData] = useState<TripInfo[]>([]);
    const tableHeaders:string[] = ["Trip Name", "Start / End Date", "Destination", "Collaborators"]
    const colors = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        red: "bg-red-500",
        yellow: "bg-yellow-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500",
        teal: "bg-teal-500",
    };
    
    useEffect(() => {
    
        async function fetchData() {
            console.log(tripsData);
            setTripsData([
                {
                    tripid: "asdkfjas;dklfjasdf",
                    name: "new york with the boys",
                    start: new Date("8-8-2025"),
                    end: new Date("8-10-2025"),
                    destination: "New York City, NY",
                    collaborators: ["Warren Wu", "Christion Bradley", "Andrew Beketov"],
                }
            ]);
        }

        fetchData();

    }, [])

    return (
        <PageContainer>

            <Navbar/>

            <div className="mt-12">
                <NavLink className={`mt-16 px-4 py-2 rounded-md bg-black text-white font-bold`} to={`/trips/${uid}/${crypto.randomUUID().toString()}/edit`}>
                    Create New Trip
                </NavLink>
            </div>

            <div className="mt-8">
                <div className="grid grid-cols-4 pb-4 border-b-2 border-black/20">
                    {tableHeaders.map((tableHeader:string) => {
                        return (
                            <p key={tableHeader} className="font-alex font-bold text-base">
                                {tableHeader}
                            </p>
                        )
                    })}
                </div>
                <div> 
                    {tripsData.map((tripInfo: TripInfo, idx: number) => {
                        return (
                            <div key={idx} className="grid grid-cols-4 py-4 font-alex font-medium text-base">
                                <NavLink
                                    to={`./${tripInfo.tripid}`}
                                    className={"flex gap-x-2 items-center"}
                                >
                                    {tripInfo.name}
                                    <RiArrowRightUpLine className="font-2xl font-bold" />
                                </NavLink>
                                <p className="flex items-center">{startEndDateNicer(tripInfo.start, tripInfo.end)}</p>
                                <p className="flex items-center">{tripInfo.destination}</p>
                                <p className="flex items-center">
                                    {tripInfo.collaborators.map((_: string, idx: number) => {
                                        return (
                                            <div key={idx} className={`-mr-2 w-8 aspect-square rounded-full ${Object.values(colors)[Math.floor(Math.random() * 7)]}`}>
                                            </div>
                                        )
                                    })}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </PageContainer>
    )
}
