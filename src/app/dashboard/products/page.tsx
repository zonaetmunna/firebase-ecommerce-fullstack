"use client";
import AddProduct from "@/app/_components/dashboard/addProduct";
import DeleteProduct from "@/app/_components/dashboard/deleteProduct";
import UpdateProduct from "@/app/_components/dashboard/updateProduct";
import firebaseApp from "@/firebase/firebase.config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

interface ProductsProps {}

const db = getFirestore(firebaseApp);

const Products: React.FC<ProductsProps> = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  // Fetch product data from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData: IProduct[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to handle adding a new product
  const handleAddProduct = async (newProductData: IProduct) => {
    try {
      await addDoc(collection(db, "products"), newProductData);
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  // Function to handle updating a product
  const handleUpdateProduct = async (
    productId: string,
    updatedProductData: Partial<IProduct>
  ) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, updatedProductData);
      setIsUpdateModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };

  // Function to handle deleting a product
  const handleDeleteProduct = async (productId: string) => {
    try {
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Add Product
      </button>
      <table className="w-full mt-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Price</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-200">
              <td className="py-2 px-4">{product.name}</td>
              <td className="py-2 px-4">{product.price}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => {
                    setIsUpdateModalOpen(true);
                    setSelectedProduct(product);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(true);
                    setSelectedProduct(product);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isAddModalOpen && (
        <AddProduct
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProduct}
        />
      )}
      {isUpdateModalOpen && selectedProduct && (
        <UpdateProduct
          product={selectedProduct}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={(updatedData) =>
            handleUpdateProduct(selectedProduct.id, updatedData)
          }
        />
      )}
      {isDeleteModalOpen && selectedProduct && (
        <DeleteProduct
          product={selectedProduct}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={() => handleDeleteProduct(selectedProduct.id)}
        />
      )}
    </div>
  );
};

export default Products;
