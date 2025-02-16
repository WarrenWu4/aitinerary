import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageContainer from "../components/PageContainer";
import SearchLocation from "../components/SearchLocation";
import DatePicker from "../components/DatePicker";
import Hero from "../components/Hero";
import ScrollPrompt from "../components/ScrollPrompt";

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = useState("");
    const navigate = useNavigate();

    return (
        <PageContainer>
            <Navbar />
            <div className="flex flex-col lg:flex-row items-center justify-between px-10 lg:px-20 mt-20">
                <div className="lg:w-1/2">
                    <Hero />
                    <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col lg:flex-row items-center gap-8 mt-8 w-full max-w-3xl border border-gray-200">
                        <SearchLocation searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        
                        <div className="h-12 w-[1px] bg-gray-200 hidden lg:block"></div>
                        
                        <DatePicker date={date} setDate={setDate} />
                        
                        <button 
                            className="bg-[#E3D1FF] text-black font-semibold px-6 py-2 rounded-lg"
                            onClick={() => navigate("/SignIn")}
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