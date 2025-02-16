// todo: fix dumbass warnings
// add onclick for active calendar and pass in the props
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface CalendarProps {
    startDate: Date;
    endDate: Date;
}

export default function Calendar({ startDate, endDate }: CalendarProps) {
    const monthMappings = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const [currentDate, setCurrentDate] = useState(startDate);
    const [activeDate, setActiveDate] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const firstDayOfMonth:number = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth:number = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

    const daysArray = [
        ...Array.from({ length: firstDayOfMonth }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];

    return (
        <div className="mt-4">
            <div className="flex gap-x-8 items-center justify-between font-bold">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="cursor-pointer"
                >
                    <FaChevronLeft/> 
                </button>
                <p className="w-32 text-center">{monthMappings[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="cursor-pointer"
                >
                    <FaChevronRight/> 
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {daysOfWeek.map((day, index) => (
                    <div
                        key={index}
                        className={`p-2 rounded-md cursor-pointer text-sm font-medium text-black/60`}
                    >
                        {day}
                    </div>
                ))}

                {daysArray.map((day, index) => {
                    if (day === null) {
                        return <div key={index} className="p-2"></div>
                    }

                    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isInRange = dayDate >= startDate && dayDate <= endDate;
                    const isActiveDate = day === activeDate.getDate() && currentDate.getMonth() === activeDate.getMonth() && currentDate.getFullYear() === activeDate.getFullYear();

                    return (
                        <div
                            key={index}
                            className={`p-2 rounded-md cursor-pointer text-sm font-medium ${isActiveDate ? "bg-blue-500 text-white" : isInRange ? "text-black hover:bg-gray-100" : "text-gray-400"}`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
