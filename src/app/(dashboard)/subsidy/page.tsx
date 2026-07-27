'use client';

import { useState } from 'react';
import { calculateSubsidy, getDailyOutput, formatCurrency } from '@/lib/subsidyCalc';
import { 
  Calculator, 
  Info, 
  CheckCircle2, 
  Zap, 
  Maximize, 
  TrendingUp,
  Percent
} from 'lucide-react';

export default function SubsidyCalculatorPage() {
  const [kw, setKw] = useState(3);
  const [type, setType] = useState<'residential' | 'commercial'>('residential');
  const [baseCostPerKw, setBaseCostPerKw] = useState(55000);

  const actualCost = kw * baseCostPerKw;
  const subsidy = calculateSubsidy(kw, type);
  const netCost = actualCost - subsidy;
  const outputs = getDailyOutput(kw);
  const savingsPercent = Math.round((subsidy / actualCost) * 100) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subsidy Calculator</h1>
        <p className="text-gray-500 text-sm">Calculate your solar investment and central subsidy savings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-blue-50 flex items-center gap-3">
            <div className="bg-[#0047FF] p-2 rounded-lg">
              <Calculator className="text-white w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">Solar ROI Calculator</h3>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">System Capacity (KW)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={kw}
                    onChange={(e) => setKw(Number(e.target.value))}
                    className="flex-1 accent-[#0047FF]"
                  />
                  <span className="text-2xl font-black text-[#0047FF] w-16 text-right">{kw} KW</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Customer Type</label>
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setType('residential')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${type === 'residential' ? 'bg-white text-[#0047FF] shadow-sm' : 'text-gray-500'}`}
                  >
                    Residential
                  </button>
                  <button
                    onClick={() => setType('commercial')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${type === 'commercial' ? 'bg-white text-[#0047FF] shadow-sm' : 'text-gray-500'}`}
                  >
                    Commercial
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Base Cost per KW (₹)</label>
                <input
                  type="number"
                  value={baseCostPerKw}
                  onChange={(e) => setBaseCostPerKw(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047FF] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Gross Cost</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(actualCost)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-[10px] text-green-600 font-bold uppercase mb-1">Central Subsidy</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(subsidy)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Net Cost</p>
                <p className="text-lg font-bold text-[#0047FF]">{formatCurrency(netCost)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Savings %</p>
                <p className="text-lg font-bold text-blue-700">{savingsPercent}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Est. Daily Generation</p>
                  <p className="text-base font-bold text-gray-900">{outputs.min}-{outputs.max} Units/Day</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Maximize className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Required Area</p>
                  <p className="text-base font-bold text-gray-900">{kw * 80}-{kw * 100} Sq. Ft.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 font-bold text-gray-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0047FF]" /> Subsidy Slab Reference
            </div>
            <div className="p-0">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-blue-50/50">
                    <td className="px-6 py-4 font-medium text-gray-600">Up to 2 KW</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">₹30,000 / KW</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-600">2 KW – 3 KW</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">₹18,000 / KW</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-600">Above 3 KW</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">Capped at ₹78k</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-600">Commercial</td>
                    <td className="px-6 py-4 text-right font-bold text-red-500">No Subsidy</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                Note: Kerala state top-up may apply additionally. KSEB net metering registration is required to avail subsidy. PM Surya Ghar Muft Bijli Yojana 2024.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0047FF] to-blue-800 rounded-2xl p-6 text-white shadow-lg">
            <h4 className="font-black text-lg mb-2">Need a detailed quote?</h4>
            <p className="text-blue-50 text-sm mb-6 leading-relaxed">
              Generate a professional PDF proposal with complete technical specifications and components.
            </p>
            <button 
              onClick={() => window.location.href = '/proposals/new'}
              className="w-full py-3 bg-white text-[#0047FF] rounded-xl font-black text-sm uppercase tracking-wider hover:bg-blue-50 transition-colors shadow-md"
            >
              Create Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
