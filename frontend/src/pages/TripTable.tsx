import PageContainer from "../components/PageContainer";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { TripInfo } from "../types";
import { RiArrowRightUpLine } from "react-icons/ri";
import { NavLink } from "react-router-dom";

export default function TripTable() {

    const [tripsData, setTripsData] = useState<TripInfo[]>([]);
    const tableHeaders:string[] = ["Trip Name", "Start / End Date", "Destination", "Collaborators"]
    
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

            <div className="mt-16">
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
                                <p>{tripInfo.start.toString()} / {tripInfo.end.toString()}</p>
                                <p>{tripInfo.destination}</p>
                                <p>{tripInfo.collaborators}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </PageContainer>
    )
}
