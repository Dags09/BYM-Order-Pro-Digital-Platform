import { steps } from "../../../../utils/constant";

export default function About() {
    return (
        <section id="about" className="bg-white px-4 py-16 md:px-8 lg:px-12">
            <div className="container mx-auto max-w-6xl">
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-kraft px-3 py-1 font-mono text-xs uppercase tracking-widest text-crate">
                            Why BYM
                        </span>

                        <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
                            Built for store owners
                            <span className="block text-crate">
                                who'd rather be open.
                            </span>
                        </h2>

                        <p className="mt-5 text-base text-ink/70 md:text-lg">
                            Every hour you spend driving to a wholesaler is an
                            hour your store is closed, or your counter is
                            unattended. BYM started with a simple idea: let
                            retailers order what they need from their phone, and
                            get it delivered before the shelf goes empty.
                        </p>

                        <p className="mt-4 text-base text-ink/70 md:text-lg">
                            No more haggling over case prices at 5am, no more
                            guessing what's in stock. Just a straightforward
                            catalog, honest pricing, and a delivery you can
                            track.
                        </p>

                        <div className="mt-8 grid grid-cols-3 gap-4 border-t-2 border-ink pt-6">
                            <div>
                                <p className="font-mono text-2xl font-semibold text-crate">
                                    500+
                                </p>
                                <p className="mt-1 text-xs text-ink/60">
                                    Stores supplied
                                </p>
                            </div>
                            <div>
                                <p className="font-mono text-2xl font-semibold text-crate">
                                    Same-day
                                </p>
                                <p className="mt-1 text-xs text-ink/60">
                                    Delivery window
                                </p>
                            </div>
                            <div>
                                <p className="font-mono text-2xl font-semibold text-crate">
                                    6
                                </p>
                                <p className="mt-1 text-xs text-ink/60">
                                    Product categories
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-ink/50">
                            How it works
                        </p>

                        <div className="space-y-6">
                            {steps.map((step, i) => {
                                const Icon = step.icon;
                                const isLast = i === steps.length - 1;
                                return (
                                    <div
                                        key={step.title}
                                        className="relative flex gap-5"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-signal text-ink">
                                                <Icon
                                                    className="h-5 w-5"
                                                    strokeWidth={2.25}
                                                />
                                            </div>
                                            {!isLast && (
                                                <div className="mt-1 w-0.5 flex-1 border-l-2 border-dashed border-ink/25" />
                                            )}
                                        </div>

                                        <div className="rounded-lg border-2 border-ink bg-kraft p-5 pb-6 shadow-[4px_4px_0_0_var(--color-crate)]">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-ink/40">
                                                    STEP {i + 1}
                                                </span>
                                            </div>
                                            <h3 className="mt-1 font-display text-lg font-semibold text-ink">
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-ink/70">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
