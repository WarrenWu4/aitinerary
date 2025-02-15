import { NavLink } from "react-router-dom";

export default function Navbar() {
    

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
                <NavLink
                    to={"/trips/default"}
                    className={({isActive}) => 
                        isActive ? "font-bold text-black" : "" 
                    }
                >
                    My Trips 
                </NavLink>
                <NavLink
                    to={"/scrapbook/default"}
                    className={({isActive}) => 
                        isActive ? "font-bold text-black" : ""
                    }
                >
                    Scrapbook
                </NavLink>
            </div>
        </div>
    )
}
