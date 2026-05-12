import MeiliSearch from "meilisearch";

export const meilisearch = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_URL ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_ADMIN_KEY ?? process.env.MEILISEARCH_MASTER_KEY ?? "",
});

export const RESTAURANTS_INDEX = "restaurants";
export const DISHES_INDEX = "dishes";
