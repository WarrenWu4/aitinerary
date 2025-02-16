import { useState, useEffect } from "react";
import { City, Country, State } from "country-state-city";
import Navbar from "../components/Navbar";
import PageContainer from "../components/PageContainer";
import { MdOutlineDateRange } from "react-icons/md";
import { GrLocation } from "react-icons/gr";

interface ICity {
    name: string;
    countryCode: string;
    stateCode: string;
    latitude: string;
    longitude: string;
    population?: string;
}

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [cities, setCities] = useState<ICity[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [date, setDate] = useState("");

    useEffect(() => {
        if (searchTerm.length < 1) {
            const allCities = City.getAllCities() as ICity[];
            const sortedBySize = allCities
                .filter(city => city.population)
                .sort((a, b) => {
                    if (a.countryCode === "US" && b.countryCode !== "US") return -1;
                    if (a.countryCode !== "US" && b.countryCode === "US") return 1;
                    
                    const popA = parseInt(a.population || '0');
                    const popB = parseInt(b.population || '0');
                    return popB - popA;
                })
                .slice(0, 10);
            setCities(sortedBySize);
            return;
        }

        const allCities = City.getAllCities() as ICity[];
        const searchResults = allCities.filter(city => 
            city.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const sortedResults = searchResults.sort((a, b) => {
            const aExactMatch = a.name.toLowerCase() === searchTerm.toLowerCase();
            const bExactMatch = b.name.toLowerCase() === searchTerm.toLowerCase();
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;

            if (a.countryCode === "US" && b.countryCode !== "US") return -1;
            if (a.countryCode !== "US" && b.countryCode === "US") return 1;

            const aStartsWith = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
            const bStartsWith = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;

            const popA = parseInt(a.population || '0');
            const popB = parseInt(b.population || '0');
            return popB - popA;
        }).slice(0, 10);

        setCities(sortedResults);
    }, [searchTerm]);

    const getLocationLabel = (city: ICity) => {
        const country = Country.getCountryByCode(city.countryCode);
        
        if (city.countryCode === "US") {
            const state = State.getStateByCodeAndCountry(city.stateCode, city.countryCode);
            return {
                displayName: `${city.name}, ${state?.name || city.stateCode}`,
                subText: state?.name || city.stateCode
            };
        }

        return {
            displayName: `${city.name}, ${country?.name}`,
            subText: country?.name
        };
    };

    return (
        <PageContainer>
            <Navbar />
            <div className="flex flex-col lg:flex-row items-center justify-between px-10 lg:px-20 mt-20">
                <div className="lg:w-1/2 text-left">
                    <h1 className="font-[Alexandria] font-semibold text-[48px] leading-[58.51px]">
                        The easiest way to plan group trips
                    </h1>
                    <p className="font-[Alexandria] font-normal text-[20px] leading-[24.38px] text-[#00000099] mt-4">
                        Collaborate in real-time to plan your fun trips <br />
                        with powerful and convenient tools we provide
                    </p>

                    <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col lg:flex-row items-center gap-8 mt-8 w-full max-w-3xl border border-gray-200">
                        <div className="flex flex-col w-full relative">
                            <div className="flex items-center gap-2">
                                <GrLocation className="text-[24px]" />
                                <p className="font-[Alexandria] font-medium text-[20px] leading-[24.38px] text-gray-800">Locations</p>
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Choose your start and end locations"
                                className="mt-1 w-full p-2 text-gray-500 text-sm border-b border-gray-200 focus:outline-none focus:border-gray-400"
                            />
                            {showDropdown && cities.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white mt-1 shadow-lg rounded-md border border-gray-200 max-h-80 overflow-y-auto z-10">
                                    {cities.map((city, index) => {
                                        const location = getLocationLabel(city);
                                        return (
                                            <div 
                                                key={index}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                                                onClick={() => {
                                                    setSearchTerm(location.displayName);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <GrLocation className="mt-1 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">{city.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {location.subText}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="h-12 w-[1px] bg-gray-200 hidden lg:block"></div>

                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2">
                                <MdOutlineDateRange className="text-[24px]" />
                                <p className="font-[Alexandria] font-medium text-[20px] leading-[24.38px] text-gray-800">Date</p>
                            </div>
                            <input
                                type="text"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                placeholder="choose your start and end dates"
                                className="mt-1 w-full p-2 text-gray-500 text-sm border-b border-gray-200 focus:outline-none focus:border-gray-400"
                            />
                        </div>
                        
                        <button className="bg-[#E3D1FF] text-black font-semibold px-6 py-2 rounded-lg">
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

            <div className="flex flex-col items-center mt-16">
                <p className="font-[Alexandria] font-medium text-gray-800">
                    simplify the planning process with our in-house AI
                </p>
                <div className="mt-4 flex flex-col items-center">
                    <span className="text-xl">↓</span>
                    <p className="uppercase text-sm tracking-wide text-gray-500 mt-2">Scroll Down</p>
                </div>
            </div>
        </PageContainer>
    );
}