import { MdOutlineDateRange } from "react-icons/md";

export default function DatePicker({ date, setDate }) {
    return (
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
    );
}