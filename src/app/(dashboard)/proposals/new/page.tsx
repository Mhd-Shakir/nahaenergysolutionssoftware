'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  FileDown, 
  Send, 
  User, 
  Building2, 
  Zap, 
  ShieldCheck, 
  FileText, 
  PenTool, 
  MapPin, 
  Smartphone,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { generateDetailedProposalPDF, DetailedProposalData } from '@/lib/detailedPdfGenerator';

const PRODUCT_LIST = [
  'Solar Module', 'Grid Tie Inverter', 'AC Surge Protector', 'DC Surge Protector', 
  'Solar Meter', 'Lightning Arrestor', 'Lightning Earth', 'Earthing Compound', 
  'Earthing Cables', 'Earthing Rod', 'AC Cable', 'DC Cable', 'Lightning Conductors', 
  'MC4 Connectors', 'Mounting Structure', 'ACMCB', 'DCMCB'
];

export default function NewProposalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<DetailedProposalData>({
    defaultValues: {
      clientName: '',
      designation: '',
      address: '',
      mobileNumber: '',
      date: '',
      projectId: '',
      locationCoordinates: '',
      companyName: '',
      provinceState: '',
      companyAddress: '',
      projectEngineerName: '',
      engineerDesignation: '',
      email: '',
      contactNumber: '',
      products: PRODUCT_LIST.map(name => ({
        name,
        brand: '',
        specification: '',
        warranty: '',
        quantity: ''
      })),
      totalProjectCost: '',
      avgDailyEnergy: '',
      avgOutputPerKw: '',
      requiredAreaPerKw: '',
      bankName: '',
      ifscCode: '',
      accountNumber: '',
      branch: '',
      solarModuleWarranty: '',
      inverterWarranty: '',
      acdbDcdbWarranty: '',
      surgeProtectorWarranty: '',
      authorisedSignatory: '',
      signatureDate: '',
      remarks: ''
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "products"
  });

  const onDownloadPDF = (data: DetailedProposalData) => {
    generateDetailedProposalPDF(data);
  };

  const onSubmit = async (data: DetailedProposalData) => {
    setIsSubmitting(true);
    // Simulate API call
    console.log('Form Submitted:', data);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Proposal submitted successfully!');
    }, 1000);
  };

  const SectionHeader = ({ icon: Icon, title, section }: { icon: any, title: string, section: string }) => (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
      <div className="p-2 bg-[#0047FF]/10 rounded-lg">
        <Icon className="w-5 h-5 text-[#0047FF]" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#0047FF] uppercase tracking-wider">{section}</p>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-4 md:py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Solar Proposal Form</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Fill in the details to generate a professional proposal document.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit(onDownloadPDF)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[#0047FF] hover:text-[#0047FF] font-bold transition-all shadow-sm"
          >
            <FileDown className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>

      <form id="detailed-proposal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Client Information */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={User} section="Section 1" title="Client Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Client Name</label>
              <input {...register('clientName')} className="input-field" placeholder="Client name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Designation</label>
              <input {...register('designation')} className="input-field" placeholder="Designation" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Mobile Number</label>
              <input {...register('mobileNumber')} className="input-field" placeholder="Mobile number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Date</label>
              <input {...register('date')} className="input-field" placeholder="Date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Project ID</label>
              <input {...register('projectId')} className="input-field" placeholder="Project ID" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Location Coordinates</label>
              <input {...register('locationCoordinates')} className="input-field" placeholder="Location coordinates" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold text-gray-700">Address</label>
              <textarea {...register('address')} rows={3} className="input-field resize-none" placeholder="Address" />
            </div>
          </div>
        </div>

        {/* Section 2: System Integrator */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={Building2} section="Section 2" title="System Integrator" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Company Name</label>
              <input {...register('companyName')} className="input-field" placeholder="Company name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Province / State</label>
              <input {...register('provinceState')} className="input-field" placeholder="Province / State" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Project Engineer Name</label>
              <input {...register('projectEngineerName')} className="input-field" placeholder="Project engineer name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Designation</label>
              <input {...register('engineerDesignation')} className="input-field" placeholder="Designation" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email</label>
              <input {...register('email')} className="input-field" placeholder="Email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Contact Number</label>
              <input {...register('contactNumber')} className="input-field" placeholder="Contact number" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold text-gray-700">Company Address</label>
              <textarea {...register('companyAddress')} rows={2} className="input-field resize-none" placeholder="Company address" />
            </div>
          </div>
        </div>

        {/* Section 3: Product Specifications */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden">
          <SectionHeader icon={Zap} section="Section 3" title="Product Specifications" />
          <div className="overflow-x-auto -mx-5 md:-mx-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Brand</th>
                  <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Specification</th>
                  <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Warranty</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-3">
                      <input 
                        {...register(`products.${index}.name`)} 
                        className="w-full bg-transparent font-bold text-gray-900 outline-none border-b border-transparent focus:border-[#0047FF]" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input {...register(`products.${index}.brand`)} className="table-input" placeholder="Brand" />
                    </td>
                    <td className="px-4 py-3">
                      <input {...register(`products.${index}.specification`)} className="table-input" placeholder="Specification" />
                    </td>
                    <td className="px-4 py-3">
                      <input {...register(`products.${index}.warranty`)} className="table-input" placeholder="Warranty" />
                    </td>
                    <td className="px-8 py-3">
                      <input {...register(`products.${index}.quantity`)} className="table-input" placeholder="Quantity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Cost Details */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={CreditCard} section="Section 4" title="Cost Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Total Project Cost</label>
              <input {...register('totalProjectCost')} className="input-field" placeholder="Total project cost" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Avg. Daily Energy Production</label>
              <input {...register('avgDailyEnergy')} className="input-field" placeholder="Average daily energy production" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Average Output per kW</label>
              <input {...register('avgOutputPerKw')} className="input-field" placeholder="Average output per kW" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Required Area per kW</label>
              <input {...register('requiredAreaPerKw')} className="input-field" placeholder="Required area per kW" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { label: '50% Advance', detail: 'Advance with order' },
              { label: '40% Material Supply', detail: 'After material supply at site' },
              { label: '10% Commissioning', detail: 'On commissioning' }
            ].map((item, i) => (
              <div key={i} className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm font-black text-[#0047FF] uppercase tracking-wider">{item.label}</p>
                <p className="text-xs text-blue-600 mt-1">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Bank Name</label>
              <input {...register('bankName')} className="input-field" placeholder="Bank name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">IFSC Code</label>
              <input {...register('ifscCode')} className="input-field" placeholder="IFSC code" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Account Number</label>
              <input {...register('accountNumber')} className="input-field" placeholder="Account number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Branch</label>
              <input {...register('branch')} className="input-field" placeholder="Branch" />
            </div>
          </div>
        </div>

        {/* Section 5: Warranty */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={ShieldCheck} section="Section 5" title="Warranty" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Solar Module Warranty</label>
              <input {...register('solarModuleWarranty')} className="input-field" placeholder="Solar module warranty" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Inverter Warranty</label>
              <input {...register('inverterWarranty')} className="input-field" placeholder="Inverter warranty" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">ACDB / DCDB Warranty</label>
              <input {...register('acdbDcdbWarranty')} className="input-field" placeholder="ACDB / DCDB warranty" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Surge Protector Warranty</label>
              <input {...register('surgeProtectorWarranty')} className="input-field" placeholder="Surge protector warranty" />
            </div>
          </div>
        </div>

        {/* Section 6: Terms & Conditions */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={FileText} section="Section 6" title="Terms & Conditions" />
          <div className="space-y-4">
            {[
              'Proposal validity: 15 days from the date of issue.',
              'Net metering approval is subject to KSEB feasibility.',
              'Customer must provide necessary documents for grid connection.',
              'Standard mounting height included. Extra height will be charged.',
              'Payment terms must be strictly followed as per the schedule.'
            ].map((term, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00A3FF]" />
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{term}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Signature */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={PenTool} section="Section 7" title="Signature" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Authorised Signatory Name</label>
              <input {...register('authorisedSignatory')} className="input-field" placeholder="Authorised signatory name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Date</label>
              <input {...register('signatureDate')} className="input-field" placeholder="Date" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Remarks</label>
            <textarea {...register('remarks')} rows={4} className="input-field resize-none" placeholder="Remarks" />
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-12 py-4 bg-[#0047FF] text-white rounded-2xl hover:bg-[#0036CC] font-black text-lg shadow-2xl shadow-blue-200 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
            Submit Proposal
          </button>
        </div>

      </form>

      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: white;
          border: 2px solid #f3f4f6;
          border-radius: 12px;
          font-weight: 500;
          color: #111827;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: #0047FF;
          box-shadow: 0 0 0 4px rgba(0, 71, 255, 0.05);
        }
        .table-input {
          width: 100%;
          padding: 0.5rem;
          background-color: transparent;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .table-input:focus {
          border-color: #0047FF;
        }
        .input-field::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}
