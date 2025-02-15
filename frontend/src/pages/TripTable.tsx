import PageContainer from "../components/PageContainer";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { TripInfo } from "../types";

export default function TripTable() {

    const [tripsData, setTripsData] = useState<TripInfo[]>([]);
    const tableHeaders:string[] = ["Trip Name", "Start / End Date", "Destination", "Collaborators"]
    
    useEffect(() => {
    
        async function fetchData() {
            console.log(tripsData);
            setTripsData([]);
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
                </div>
            </div>
        </PageContainer>
    )
}
