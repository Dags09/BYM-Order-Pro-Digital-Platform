import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Wallet } from "lucide-react";

export default function Hero() {
    return (
        <section
            id="home"
            className="relative flex min-h-screen items-center overflow-hidden bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat"
        >
            {/* Directional scrim: dark where the text sits, fading out
                toward the right so the photo's subject stays visible. */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-transparent"
                aria-hidden="true"
            />

            <div className="relative z-10 w-full px-4 py-24 md:px-8 lg:px-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-kraft/30 bg-white/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-kraft backdrop-blur-md">
                            Easy Re-stock, Fast Delivery
                        </span>

                        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-kraft md:text-5xl lg:text-6xl">
                            Restock,
                            <span className="block text-signal">
                                not road trips.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-lg text-base font-medium text-kraft/90 md:text-lg">
                            Order wholesale groceries and essentials for your
                            store and get them delivered same-day — at case
                            prices, on your schedule.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                to="/shop"
                                className="rounded-md bg-crate px-7 py-3 text-sm font-bold text-kraft shadow-[3px_3px_0_0_theme(colors.ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_theme(colors.ink)]"
                            >
                                Order Now
                            </Link>
                            <Link
                                to="/shop"
                                className="rounded-md border-2 border-kraft px-7 py-3 text-sm font-bold text-kraft transition hover:bg-kraft hover:text-ink"
                            >
                                See case prices
                            </Link>
                        </div>

                        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-kraft/20 pt-6">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 shrink-0 text-signal" />
                                <span className="text-xs font-medium text-kraft/90">
                                    Same-day delivery
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 shrink-0 text-signal" />
                                <span className="text-xs font-medium text-kraft/90">
                                    COD · GCash · Maya
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 shrink-0 text-signal" />
                                <span className="text-xs font-medium text-kraft/90">
                                    500+ stores supplied
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
