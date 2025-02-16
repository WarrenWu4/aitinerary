import { useState, useEffect } from "react";
import { City, Country, State } from "country-state-city";
import { GrLocation } from "react-icons/gr";

interface LocationEditsProps {
    location: string;
    setLocation: (location: string) => void;
}

interface ICity {
    name: string;
    countryCode: string;
    stateCode: string;
    latitude: string;
    longitude: string;
    population?: string;
}

export default function LocationEdits({location, setLocation}: LocationEditsProps) {

    const [cities, setCities] = useState<ICity[]>([]);
    const [searchTerm, setSearchTerm] = useState(location);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setLocation(e.target.value);
        setShowDropdown(true);
    };

    const handleSuggestionClick = (city: ICity) => {
        setSearchTerm(getLocationLabel(city).displayName);
        setLocation(getLocationLabel(city).displayName);
        setShowDropdown(false);
    };

    return (
        <div className="relative w-full">
            <div className="w-full mt-2 flex gap-x-4 items-center text-gray-400 text-sm font-semibold">
                <p>Start</p>
                <div className="w-full h-[2px] rounded-full bg-gray-200"></div>
                <p>End</p>
            </div>
            <div className="flex gap-x-4 items-center">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
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
                                    onClick={() => handleSuggestionClick(city)}
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
        </div>
    )
}
