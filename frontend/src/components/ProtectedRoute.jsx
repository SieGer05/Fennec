import { Navigate } from "react-router-dom";
import DeviceError from "./DeviceError";
import { isMobileOrTablet } from "../utils/isMobileOrTablet";

function ProtectedRoute({ children }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const isMobile = isMobileOrTablet();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (isMobile) {
        return <DeviceError />;
    }

    return children;
}

export default ProtectedRoute;