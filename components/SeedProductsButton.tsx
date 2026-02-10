import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { PRODUCTS } from '../constants';
import api, { transformProductForBackend } from '../utils/api';

interface SeedProductsButtonProps {
  onProductsAdded: () => void;
}

const SeedProductsButton: React.FC<SeedProductsButtonProps> = ({ onProductsAdded }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: number; errors: number } | null>(null);

  const handleSeedProducts = async () => {
    if (!confirm(`This will add ${PRODUCTS.length} products from constants.ts to the database. Continue?`)) {
      return;
    }

    setLoading(true);
    setStatus(null);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < PRODUCTS.length; i++) {
      const product = PRODUCTS[i];
      const productData = transformProductForBackend(product);

      try {
        await api.post('/api/products', productData);
        successCount++;
      } catch (error: any) {
        // If product already exists (409 conflict), count as success
        if (error.response?.status === 409 || error.response?.status === 400) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Failed to add ${product.name}:`, error);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setStatus({ success: successCount, errors: errorCount });
    setLoading(false);
    
    if (successCount > 0) {
      onProductsAdded();
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleSeedProducts}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="h-4 w-4" />
        {loading ? 'Adding Products...' : `Seed ${PRODUCTS.length} Products from constants.ts`}
      </button>
      
      {status && (
        <div className={`mt-2 p-3 rounded-lg ${
          status.errors === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            {status.errors === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-yellow-600" />
            )}
            <div className="text-sm">
              <p className="font-medium">
                {status.errors === 0 ? 'All products added successfully!' : 'Seeding completed with some errors'}
              </p>
              <p className="text-gray-600">
                ✅ Success: {status.success} | ❌ Errors: {status.errors}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeedProductsButton;
