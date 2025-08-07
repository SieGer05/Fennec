import { IMAGES } from "../../assets";

function Header() {
    return (
        <div className="border-b border-b-purple-300 shadow-sm rounded-3xl flex items-center justify-between px-4 relative h-20 mb-7">
            <div className="w-1/3 text-left">
                <div className="flex items-center font-bold text-black font-opensans text-4xl tracking-wide">
                    <span>FENNEC</span>
                    <span className="text-purple-800 text-xl ml-2">⬤</span>
                </div>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2">
                <img 
                    src={IMAGES.Logo} 
                    alt="logo"
                    className="h-12 w-auto drop-shadow-md"
                />
            </div>

            <div className="w-1/3 text-right">
                <div className="flex items-center justify-end space-x-4">
                    <span className="text-2xl font-light text-purple-400">Auditing</span>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}

export default Header;
