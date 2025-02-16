import Navbar from "../components/Navbar";
import PageContainer from "../components/PageContainer";
import { MdOutlineDateRange } from "react-icons/md";
import { GrLocation } from "react-icons/gr";

export default function Home() {
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
                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2">
                                <GrLocation className="text-[24px]" />
                                <p className="font-[Alexandria] font-medium text-[20px] leading-[24.38px] text-gray-800">Locations</p>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">choose your start and end locations</p>
                        </div>

                        <div className="h-12 w-[1px] bg-gray-200 hidden lg:block"></div>

                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2">
                                <MdOutlineDateRange className="text-[24px]" />
                                <p className="font-[Alexandria] font-medium text-[20px] leading-[24.38px] text-gray-800">Date</p>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">choose your start and end dates</p>
                        </div>

                        <button className="bg-[#E3D1FF] text-black font-semibold px-6 py-2 rounded-lg">
                            Plan
                        </button>
                    </div>
                </div>

                {/* Right Side - Image */}
                <img
                                src="/homeicon.jpg"
                                alt="Trip Image"
                                className=""
                                width={800}
                                height={800}
                            />
            </div>

            {/* Scroll Down Indicator */}
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
