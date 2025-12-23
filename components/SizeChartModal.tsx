import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sizeChart = [
    { size: 'S', brandSize: '36', bust: '34', waist: '32', hip: '36' },
    { size: 'M', brandSize: '38', bust: '36', waist: '34', hip: '38' },
    { size: 'L', brandSize: '40', bust: '38', waist: '36', hip: '40' },
    { size: 'XL', brandSize: '42', bust: '40', waist: '38', hip: '42' },
    { size: '2XL', brandSize: '44', bust: '42', waist: '40', hip: '44' },
    { size: '3XL', brandSize: '46', bust: '44', waist: '42', hip: '46' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-brand-700" />
            <h2 className="text-xl font-serif font-bold text-gray-900">SIZE CHART AS PER BODY MEASUREMENTS</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4 text-center">(in Inches)</p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-brand-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-900">Size</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-900">BRAND SIZE</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-900">TO FIT BUST</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-900">TO FIT WAIST</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-900">TO FIT HIP</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.size} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900">{row.size}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">{row.brandSize}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">{row.bust}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">{row.waist}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              Find the size to fit your body measurements in the chart above. Here is a handy body measurement guide:
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong className="text-gray-900">Shoulder:</strong> Measure across the shoulders from edge to edge.</p>
              <p><strong className="text-gray-900">Bust:</strong> Measure around the fullest part of your chest.</p>
              <p><strong className="text-gray-900">Waist:</strong> Measure around the narrowest part of your waist.</p>
              <p><strong className="text-gray-900">Hips:</strong> Measure around the fullest part of your hips.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;


