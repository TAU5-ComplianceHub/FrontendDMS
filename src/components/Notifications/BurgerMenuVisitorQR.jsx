import { useNavigate } from "react-router-dom";

const BurgerMenuVisitorQR = ({ isOpen, setIsOpen, viewQR }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("visitorToken");
        navigate("/FrontendDMS/visitorLogin");
    };

    return (
        <div className="burger-menu-container-FI">
            {isOpen && (
                <div className="menu-content-FI" onMouseLeave={() => setIsOpen(false)}>
                    <ul>
                        <li onClick={viewQR}>View QR Code</li>
                    </ul>
                    <ul>
                        <li onClick={handleLogout}>Logout</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BurgerMenuVisitorQR;