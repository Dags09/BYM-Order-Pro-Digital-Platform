import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import NavBar from "../../components/pageComponents/customer/homePage/navBar";
import Hero from "../../components/pageComponents/customer/homePage/hero";
import About from "../../components/pageComponents/customer/homePage/about";
import Partnerships from "../../components/pageComponents/customer/homePage/partnerships";
import Products from "../../components/pageComponents/customer/homePage/products";
import Footer from "../../components/pageComponents/customer/homePage/footer";

// Where a signed-in staff account belongs instead of the public storefront.
const STAFF_DASHBOARD_PATH: Record<string, string> = {
    admin: "/admin",
    manager: "/manager",
    staff: "/staff",
};

export default function homePage() {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user && user.role in STAFF_DASHBOARD_PATH) {
        return <Navigate to={STAFF_DASHBOARD_PATH[user.role]} replace />;
    }

    return (
        <div>
            <NavBar />
            <div id="home">
                <Hero />
            </div>
            <div id="products">
                <Products />
            </div>
            <div id="about">
                <About />
            </div>
            <Partnerships />
            <div id="contact">
                <Footer />
            </div>
        </div>
    );
}
