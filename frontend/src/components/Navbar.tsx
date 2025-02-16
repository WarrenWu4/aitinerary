import { NavLink } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    console.log("Current user in Navbar:", user);

    return (
        <div className="w-full flex justify-between items-center pb-5 border-b-2 border-black/40">
            <NavLink to={"/"} className="flex items-center gap-x-2">
                <img
                    src="/Logo.svg"
                    width={28}
                    height={28}
                />
                <p className="font-bold text-2xl font-alex">
                    AITINERARY
                </p>
            </NavLink>
            <div className="flex items-center gap-x-6 font-alex text-black/60">
                <NavLink
                    to={"/"}
                    className={({isActive}) => 
                        isActive ? "font-bold text-black" : "" 
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to={"/about"}
                    className={({isActive}) => 
                        isActive ? "font-bold text-black" : "" 
                    }
                >
                    About
                </NavLink>
                {user ? (
                    <>
                        <NavLink
                            to={`/trips/${user._id}`}
                            className={({isActive}) => 
                                isActive ? "font-bold text-black" : "" 
                            }
                        >
                            My Trips 
                        </NavLink>
                        <NavLink
                            to={`/scrapbook/${user._id}`}
                            className={({isActive}) => 
                                isActive ? "font-bold text-black" : ""
                            }
                        >
                            Scrapbook
                        </NavLink>
                        <span className="bg-[#D5C8FC] px-4 py-2 rounded-md">
                            {user.name}
                        </span>
                    </>
                ) : (
                    <NavLink
                        to={"/signin"}
                        className="bg-[#D5C8FC] px-4 py-2 rounded-md hover:bg-[#c4b3fc] transition-colors"
                    >
                        Sign In
                    </NavLink>
                )}
            </div>
        </div>
    );
}
