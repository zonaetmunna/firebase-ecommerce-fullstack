import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiSlice = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "",
  }),
  tagTypes: ["product", "auth", "store", "category", "brand", "order"],
  endpoints: (builder) => ({}),
});

export default apiSlice;
