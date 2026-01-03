import React from 'react';
import { X } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sizeChart = [
    { size: 'S', bust: '34-36', waist: '28-30', hips: '36-38', length: '38-40' },
    { size: 'M', bust: '36-38', waist: '30-32', hips: '38-40', length: '40-42' },
    { size: 'L', bust: '38-40', waist: '32-34', hips: '40-42', length: '42-44' },
    { size: 'XL', bust: '40-42', waist: '34-36', hips: '42-44', length: '44-46' },
    { size: 'XXL', bust: '42-44', waist: '36-38', hips: '44-46', length: '46-48' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Size Chart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-brand-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Size</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Bust (inches)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Waist (inches)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Hips (inches)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Length (inches)</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.size} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">{row.size}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.bust}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.waist}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.hips}</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Measurements are in inches. For best fit, measure yourself and compare with the size chart. 
              If you're between sizes, we recommend going up one size.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;

