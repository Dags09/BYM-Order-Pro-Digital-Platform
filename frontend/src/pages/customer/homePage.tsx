import NavBar from "../../components/pageComponents/customer/homePage/navBar";
import Hero from "../../components/pageComponents/customer/homePage/hero";
import About from "../../components/pageComponents/customer/homePage/about";
import Partnerships from "../../components/pageComponents/customer/homePage/partnerships";
import Products from "../../components/pageComponents/customer/homePage/products";
import Footer from "../../components/pageComponents/customer/homePage/footer";

export default function homePage() {
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
