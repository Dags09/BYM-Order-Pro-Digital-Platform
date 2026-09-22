import { useEffect, useState } from "react";
import { Navigation2, ExternalLink, MapPin } from "lucide-react";
import type { ShippingAddress } from "../../../types/order";

interface DestinationMapProps {
    address: ShippingAddress;
}

interface Coords {
    lat: number;
    lon: number;
}

export default function DestinationMap({ address }: DestinationMapProps) {
    const [coords, setCoords] = useState<Coords | null>(null);
    const [status, setStatus] = useState<"loading" | "found" | "error">(
        "loading",
    );

    const fullAddress = `${address.street}, ${address.city}, ${address.province} ${address.zipCode}, Philippines`;

    useEffect(() => {
        let cancelled = false;
        setStatus("loading");
        setCoords(null);

        const query = encodeURIComponent(fullAddress);
        fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
        )
            .then((res) => res.json())
            .then((results: Array<{ lat: string; lon: string }>) => {
                if (cancelled) return;
                if (results?.[0]) {
                    setCoords({
                        lat: parseFloat(results[0].lat),
                        lon: parseFloat(results[0].lon),
                    });
                    setStatus("found");
                } else {
                    setStatus("error");
                }
            })
            .catch(() => {
                if (!cancelled) setStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, [fullAddress]);

    const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        fullAddress,
    )}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        fullAddress,
    )}`;

    const pad = 0.006;
    const embedUrl = coords
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${
              coords.lon - pad
          }%2C${coords.lat - pad}%2C${coords.lon + pad}%2C${
              coords.lat + pad
          }&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`
        : null;

    return (
        <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Destination
                </p>
                <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-crate hover:underline"
                >
                    Open in Maps
                    <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                </a>
            </div>

            <div className="mt-3 overflow-hidden rounded-md border border-ink/10 bg-kraft">
                {status === "loading" && (
                    <div className="flex h-40 items-center justify-center text-sm text-ink/40">
                        Locating address…
                    </div>
                )}
                {status === "error" && (
                    <div className="flex h-40 flex-col items-center justify-center gap-1 text-sm text-ink/40">
                        <MapPin className="h-5 w-5" strokeWidth={1.5} />
                        Couldn't pinpoint this address on the map.
                    </div>
                )}
                {status === "found" && embedUrl && (
                    <iframe
                        title="Destination map"
                        src={embedUrl}
                        className="h-40 w-full"
                        loading="lazy"
                    />
                )}
            </div>

            <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-md bg-crate py-2.5 text-sm font-medium text-white transition-colors hover:bg-crate-dark"
            >
                <Navigation2 className="h-4 w-4" strokeWidth={1.75} />
                Get directions
            </a>
        </div>
    );
}
