"use client";

import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import ProductsSection from "@/components/home/ProductsSection";
import { getActiveCategories } from "@/fetures/category/categorySlice";
import {
  getFeaturedProducts,
  getTopProducts,
} from "@/fetures/product/productSlice";
import { RootState } from "@/fetures/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function HomePage() {
  const dispatch = useDispatch();
  const {
    featuredProducts,
    topProducts,
    loading: productLoading,
  } = useSelector((state: RootState) => state.product);
  const { categories, loading: categoryLoading } = useSelector(
    (state: RootState) => state.category
  );

  useEffect(() => {
    dispatch(getFeaturedProducts(8) as any);
    dispatch(getTopProducts(6) as any);
    dispatch(getActiveCategories() as any);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Categories Section */}
      {!categoryLoading && categories.length > 0 && (
        <CategoriesSection categories={categories} />
      )}

      {/* Featured Products Section */}
      {!productLoading && featuredProducts.length > 0 && (
        <ProductsSection
          featuredProducts={featuredProducts}
          topProducts={topProducts}
          title="Featured Products"
          subtitle="Handpicked products just for you"
          products={featuredProducts}
          showType="featured"
        />
      )}

      {/* Top Products Section */}
      {!productLoading && topProducts.length > 0 && (
        <ProductsSection
          featuredProducts={featuredProducts}
          topProducts={topProducts}
          title="Trending Now"
          subtitle="Most popular products this week"
          products={topProducts}
          showType="top"
        />
      )}
    </div>
  );
}
