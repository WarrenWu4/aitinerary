import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PageContainer from "../components/PageContainer";
import SearchLocation from "../components/SearchLocation";
import DatePicker from "../components/DatePicker";
import Hero from "../components/Hero";
import ScrollPrompt from "../components/ScrollPrompt";
import dayjs from 'dayjs';

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState([null, null]);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handlePlanClick = () => {
        if (!user) {
            navigate("/SignIn");
            return;
        }
        const tripData = {
            location: searchTerm,
            startDate: dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : null,
            endDate: dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : null
        };
        navigate(`/trips/${user._id}/new`, { 
            state: { tripData }
        });
    };

    return (
        <PageContainer>
            <Navbar />
            <div className="flex flex-col lg:flex-row items-center justify-between px-10 lg:px-20 mt-20">
                <div className="lg:w-1/2">
                    <Hero />
                    <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col lg:flex-row items-center gap-8 mt-8 w-full max-w-3xl border border-gray-200">
                        <SearchLocation searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        
                        <div className="h-12 w-[1px] bg-gray-200 hidden lg:block"></div>
                        
                        <DatePicker date={dateRange} setDate={setDateRange} />
                        
                        <button 
                            className="bg-[#E3D1FF] text-black font-semibold px-6 py-2 rounded-lg disabled:opacity-50"
                            onClick={handlePlanClick}
                            disabled={!searchTerm || !dateRange[0] || !dateRange[1]}
                        >
                            Plan
                        </button>
                    </div>
                </div>

                <img
                    src="/homeicon.jpg"
                    alt="Trip Image"
                    className=""
                    width={800}
                    height={800}
                />
            </div>

            <ScrollPrompt />
        </PageContainer>
    );
}