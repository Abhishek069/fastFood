// import foody from "../assets/images/foody.png";
// import cartIcon from "../assets/icons/cart.svg";
// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import Button from "./elements/Button";
// import { useEffect, useState } from "react";

// export const Header = ({ cartCount }) => {
//     const navigate = useNavigate();
//     const [isLoggedIn, setIsLoggedIn] = useState(false);

//     const handleLogout = () => {
//         sessionStorage.removeItem('Auth token');
//         sessionStorage.removeItem('User Id');
//         window.dispatchEvent(new Event("storage"))
//         navigate("/");
//     }

//     useEffect(() => {
//         const checkAuthToken = () => {
//             const token = sessionStorage.getItem('Auth token');
//             if (token) {
//                 setIsLoggedIn(true);
//             } else {
//                 setIsLoggedIn(false);
//             }
//         }

//         window.addEventListener('storage', checkAuthToken);

//         return () => {
//             window.removeEventListener('storage', checkAuthToken);
//         }
//     }, [])

//     return (
//         <nav id="header" className="bg-black text-white">
//             <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
//                 <div className="logo-wrapper pl-4 flex items-center">
//                     <Link to="/" className="toggleColor text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
//                         <img src={foody} alt="logo" className="w-40 h-40 object-cover"/>
//                     </Link>
//                 </div>
//                 <div className="nav-menu-wrapper flex items-center justify-between space-x-10">
//                     <Link to="/" className="text-xl">Home</Link>
//                     <Link to="#about" className="text-xl">About</Link>
//                 </div>
//                 <div className="flex items-center justify-center space-x-4">
//                     <Link to="/cart" className="mr-4 relative">
//                         <img src={cartIcon} alt="cart"/>
//                         {cartCount > 0 ? <div className="rounded-full bg-yellow-400 text-white inline-flex justify-center items-center w-full absolute -top-1 -right-1">{cartCount}</div> : null}
//                     </Link>
//                     {
//                         isLoggedIn ? 
//                         <Button onClick={handleLogout}>Log Out</Button> : 
//                         (
//                             <>
//                              <Link to="/login">Log In</Link>
//                              <Link to="/register">Sign Up</Link>
//                             </>
//                         )
//                     }
//                 </div>
//             </div>
//         </nav>
//     )
// }

import foody from "../assets/images/foody.png";
import cartIcon from "../assets/icons/cart.svg";
import { Link, useNavigate } from "react-router-dom";
import Button from "./elements/Button";
import { useEffect, useState } from "react";

export const Header = ({ cartCount }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            
            const token = localStorage.getItem("authToken");
            const user = localStorage.getItem("user");
            // console.log(user);
            if(token.valueOf){
                console.log(true);
                setIsLoggedIn(true);
            }
            else{
                setIsLoggedIn(false);
                
            }
        };

        checkAuth(); // Check authentication on mount

        window.addEventListener("storage", checkAuth); // Listen for storage changes

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        // const user = localStorage.removeItem("user");
        // console.log(user);
        
        
        setIsLoggedIn(false);
        navigate("/");
        window.dispatchEvent(new Event("storage")); // Trigger auth state change
    };

    return (
        <nav id="header" className="bg-black text-white">
            <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
                {/* Logo */}
                <div className="logo-wrapper pl-4 flex items-center">
                    <Link to="/" className="toggleColor text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
                        <img src={foody} alt="logo" className="w-40 h-40 object-cover"/>
                    </Link>
                </div>

                {/* Navigation Menu */}
                <div className="nav-menu-wrapper flex items-center justify-between space-x-10">
                    <Link to="/" className="text-xl">Home</Link>
                    <Link to="#about" className="text-xl">About</Link>
                    <Link to="/histroy" className="text-xl">Order History</Link>
                </div>

                {/* Cart & Auth Buttons */}
                <div className="flex items-center justify-center space-x-4">
                    {/* Cart */}
                    <Link to="/cart" className="mr-4 relative">
                        <img src={cartIcon} alt="cart"/>
                        {cartCount > 0 && (
                            <div className="rounded-full bg-yellow-400 text-white inline-flex justify-center items-center w-full absolute -top-1 -right-1">
                                {cartCount}
                            </div>
                        )}
                    </Link>

                    {/* Authentication Buttons */}
                    {isLoggedIn ? (
                        <Button onClick={handleLogout}>Log Out</Button>
                    ) : (
                        <>
                            <Link to="/login" className="text-xl">Log In</Link>
                            <Link to="/register" className="text-xl">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
