import type { Product } from "../types/products";

export function getRecommendedProducts(
    products: Product[],
    searchHistory: string[],
) {
    const inStock = products.filter((p: Product) => p.stock > 0);
    if (searchHistory.length === 0) {
        return [...inStock].sort(() => Math.random() - 0.5).slice(0, 8);
    }

    const scored = inStock.map((p: Product) => {
        const haystack = (
            p.name +
            " " +
            (p.category?.name ?? "")
        ).toLowerCase();
        const score = searchHistory.reduce(
            (s: number, term: string, idx: number) => {
                const weight = 1 / (idx + 1);
                return haystack.includes(term) ? s + weight : s;
            },
            0,
        );
        return { ...p, _score: score };
    });

    return scored
        .sort(
            (
                a: Product & { _score: number },
                b: Product & { _score: number },
            ) => b._score - a._score || Math.random() - 0.5,
        )
        .slice(0, 8);
}
