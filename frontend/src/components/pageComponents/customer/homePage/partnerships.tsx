import { Boxes } from "lucide-react";
import { partners } from "../../../../utils/constant";

export default function Partnerships() {
    return (
        <section className="bg-kraft px-4 py-16 md:px-8 lg:px-12">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-10 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-1 font-mono text-xs uppercase tracking-widest text-crate">
                        Supply partners
                    </span>
                    <h2 className="mt-5 font-display text-3xl font-bold text-ink md:text-4xl">
                        Sourced from brands
                        <span className="block text-crate">
                            retailers already trust.
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {partners.map((partner) => (
                        <div
                            key={partner}
                            className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border-2 border-ink bg-white px-3 text-center shadow-[3px_3px_0_0_theme(colors.ink)]"
                        >
                            <Boxes
                                className="h-5 w-5 text-crate"
                                strokeWidth={2}
                            />
                            <span className="font-display text-xs font-semibold leading-tight text-ink">
                                {partner}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="mx-auto mt-6 max-w-lg text-center font-mono text-xs text-ink/50">
                    These are placeholder names for demonstration purposes only
                    and do not represent real suppliers or partners.
                </p>
            </div>
        </section>
    );
}
