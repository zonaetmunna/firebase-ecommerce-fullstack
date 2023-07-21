"use client";
import { Dialog } from "@headlessui/react";

interface DeleteProductProps {
  product: IProduct | null;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteProduct({
  product,
  onClose,
  onDelete,
}: DeleteProductProps) {
  return (
    <Dialog open={!!product} onClose={onClose} className="fixed inset-0 z-10">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold">
            Delete Product
          </Dialog.Title>

          <Dialog.Description className="my-4">
            Are you sure you want to delete this product?
          </Dialog.Description>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
