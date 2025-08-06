import { useNavigate } from "react-router-dom";
import { IMAGES } from "../assets";

function NotFound() {
    const navigate = useNavigate();

    const handleGoBackHome = () => {
        navigate("/");
    };

    return (
        <div 
            className="bg-purple-100 w-full h-screen flex flex-col items-center justify-center"
        >
            <img 
                src={IMAGES.SadFox} 
                alt="Sad Fox"
                className="w-80 h-auto mb-3" 
            />
            <h1 className="text-purple-900 text-8xl font-bold">
                404
            </h1>
            <h3 className="text-purple-800 mt-1 text-md font-medium mb-5">
                Sorry, the page was not found
            </h3>
            <button 
                className="text-white bg-purple-800 px-5 py-2 rounded-3xl
                    text-2xl font-medium hover:bg-purple-900 cursor-pointer"
                onClick={handleGoBackHome}
            >
                Back to Home
            </button>
        </div>
    );
}

export default NotFound;
