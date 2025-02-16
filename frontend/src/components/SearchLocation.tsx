import { useState, useEffect } from "react";
import { City, Country, State } from "country-state-city";
import { GrLocation } from "react-icons/gr";

interface ICity {
    name: string;
    countryCode: string;
    stateCode: string;
    latitude: string;
    longitude: string;
    population?: string;
}

export default function SearchLocation({ searchTerm, setSearchTerm }) {
    const [cities, setCities] = useState<ICity[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

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
        <div className="flex flex-col w-full relative">
            <div className="flex items-center gap-2">
                <GrLocation className="text-[24px]" />
                <p className="font-[Alexandria] font-medium text-[20px] leading-[24.38px] text-gray-800">Location</p>
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
    );
}