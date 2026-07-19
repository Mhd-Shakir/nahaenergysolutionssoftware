'use client';

import { useState, useEffect } from 'react';
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
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateDetailedProposalPDF, DetailedProposalData } from '@/lib/detailedPdfGenerator';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

const DEFAULT_PRODUCTS = [
  { name: 'Solar Module', brand: 'RAYZON, WAAREE, ADANI, RENEW', specification: 'Half cut mono perc bifacial - DCR Panels', warranty: '30 Year', quantity: '10 KW' },
  { name: 'Grid Tie Inverter', brand: 'EVVO/DEYE (ISO Certified)', specification: '10 KW capacity', warranty: '10 Year', quantity: '1' },
  { name: 'AC Surge Protector', brand: 'PHOENIX CONTACT/HAVELLS', specification: 'TYPE 2', warranty: '1 Year', quantity: '1' },
  { name: 'DC Surge Protector', brand: 'CITEL/MERSEN/HAVELLS', specification: '600/1200 V', warranty: '1 Year', quantity: '2' },
  { name: 'Solar Meter', brand: 'VISION TEK/SECURE/L&T/SOLTEK', specification: 'SINGLE PHASE', warranty: '5 years', quantity: '1' },
  { name: 'Lightning Arrestor', brand: 'EXCELEARTHING/ECO SOLTEK', specification: '20 MMx1000 MM MULTI-SPIKE', warranty: '10 year', quantity: '1' },
  { name: 'Lightning Earth', brand: 'EXCEL EARTHING/GI PIPE', specification: '4/5 FEET', warranty: '10 year', quantity: '1' },
  { name: 'Earthing Compound', brand: 'EXCELEARTHING/ECO SOLTEK', specification: '5KG', warranty: 'N/A', quantity: '1' },
  { name: 'Earthing Cables', brand: '10/12 SWG COPPER', specification: 'FULL COPPER', warranty: '10 year', quantity: '1 kg Approx' },
  { name: 'Earthing Rod', brand: 'EXCELEARTHING/ECO SOLTEK', specification: 'Copperbonded Rod | 16-20 mm | 100 micron', warranty: '10 year', quantity: '3' },
  { name: 'AC Cable', brand: 'KBE/POLYCAB', specification: '4/6 MM', warranty: '10 year', quantity: 'Req' },
  { name: 'DC Cable', brand: 'WAREE/POLYCAB/HAVELLS/KANBEY', specification: '4MM', warranty: '10 year', quantity: 'Req' },
  { name: 'Lightning Conductors', brand: 'EXCELEARTHING/ECO SOLTEK', specification: '50 SQUARE MM ALUMINUM', warranty: '10 year', quantity: 'Req' },
  { name: 'Down Conductors', brand: 'EXCELEARTHING/ECO SOLTEK', specification: 'Standard GI/Copper', warranty: '10 year', quantity: 'Req' },
  { name: 'MC4 Connectors', brand: 'WAREE/SIBASS', specification: 'Weatherproof', warranty: '10 year', quantity: 'Req' },
  { name: 'Mounting Structure', brand: 'GI&GP APPOLO/TATA/EQUIVALENT', specification: '16 mm, Square Cube', warranty: '10 year', quantity: 'Req' },
  { name: 'ACMCB', brand: 'HAVELLS/V-GUARD/SCHNEIDER', specification: '32 A Four pole', warranty: '10 Year', quantity: '1' },
  { name: 'DCMCB', brand: 'HAVELLS/V-GUARD/SCHNEIDER', specification: '16 A', warranty: '10 Year', quantity: '2' }
];

export default function NewProposalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<DetailedProposalData>({
    defaultValues: {
      clientName: '',
      clientType: 'residential',
      clientStateDistrict: '',
      address: '',
      mobileNumber: '',
      date: new Date().toISOString().split('T')[0],
      projectId: `PJ-${Math.floor(1000 + Math.random() * 9000)}`,
      locationCoordinates: '',
      companyName: 'NAHA ENERGY SOLUTIONS',
      provinceState: 'Kerala',
      companyAddress: 'MNRE Approved | KSEB Grid Connect System | Kerala',
      projectEngineerName: 'Irfan',
      engineerDesignation: 'Project Engineer',
      email: 'nahaenergysolutions01@gmail.com',
      contactNumber: '+91 80891 35003',
      products: DEFAULT_PRODUCTS,
      totalProjectCost: '',
      advancePaid: '',
      balanceAmount: '',
      avgDailyEnergy: '',
      avgOutputPerKw: '',
      requiredAreaPerKw: '',
      bankName: '',
      ifscCode: '',
      accountNumber: '',
      branch: '',
      solarModuleWarranty: '30 Year Performance Warranty',
      inverterWarranty: '10 Year Product Warranty',
      acdbDcdbWarranty: '1 Year Warranty',
      surgeProtectorWarranty: '1 Year Warranty',
      authorisedSignatory: 'Manager - Naha Energy',
      signatureDate: new Date().toISOString().split('T')[0],
      remarks: 'Includes installation, structure, KSEB charges and net metering approval.'
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "products"
  });

  const totalCostVal = watch('totalProjectCost');
  const advanceVal = watch('advancePaid');

  useEffect(() => {
    const cost = parseFloat(totalCostVal || '') || 0;
    const adv = parseFloat(advanceVal || '') || 0;
    setValue('balanceAmount', String(cost - adv));
  }, [totalCostVal, advanceVal, setValue]);

  const onDownloadPDF = async (data: DetailedProposalData) => {
    await generateDetailedProposalPDF(data);
  };

  const supabase = createClient();
  const router = useRouter();

  const onSubmit = async (data: DetailedProposalData) => {
    setIsSubmitting(true);
    
    try {
      const costString = String(data.totalProjectCost || '');
      const amount = parseFloat(costString.replace(/[^0-9.]/g, '')) || 0;
      const kw = parseFloat(data.products.find(p => p.name.includes('Module'))?.quantity || '0') || 0;

      // 1. Create/Update Customer entry
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .insert({
          project_id: data.projectId || `PJ-${Math.floor(Math.random() * 10000)}`,
          name: data.clientName,
          phone: data.mobileNumber,
          address: data.address,
          system_kw: kw,
          panel_brand: data.products.find(p => p.name.includes('Module'))?.brand || 'Standard',
          inverter_brand: data.products.find(p => p.name.includes('Inverter'))?.brand || 'Standard',
          actual_cost: amount,
          subsidy: 0, // Default to 0, can be updated later
          net_cost: amount,
          status: 'quoted',
          type: data.clientType || 'residential', // Use the selected client type from dropdown!
          district: data.clientStateDistrict || 'Kerala',
        })
        .select()
        .single();

      if (custError) throw custError;

      // 2. Record as a Sale for Analytics
      const { error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: customer.id,
          amount: amount,
          district: data.clientStateDistrict || 'Kerala',
          sale_date: new Date().toISOString()
        });

      if (saleError) throw saleError;

      // 3. Record as a Proposal in the database
      const { error: proposalError } = await supabase
        .from('proposals')
        .insert({
          proposal_number: data.projectId || `PJ-${Math.floor(Math.random() * 10000)}`,
          customer_id: customer.id,
          system_kw: kw,
          panel_brand: data.products.find(p => p.name.includes('Module'))?.brand || 'Standard',
          inverter_brand: data.products.find(p => p.name.includes('Inverter'))?.brand || 'Standard',
          actual_cost: amount,
          subsidy: 0,
          net_cost: amount,
          daily_output_min: Math.floor(kw * 3.8),
          daily_output_max: Math.ceil(kw * 4.2),
          notes: data.remarks || '',
          sent_at: new Date().toISOString(),
          valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (proposalError) throw proposalError;

      toast.success('Proposal submitted and revenue recorded!');
      router.push('/customers');
    } catch (err: any) {
      console.error('Submission Error:', err);
      toast.error('Error saving proposal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, section }: { icon: any, title: string, section: string }) => (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
      <div className="p-2 bg-[#0B07D7]/10 rounded-lg">
        <Icon className="w-5 h-5 text-[#0B07D7]" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#0B07D7] uppercase tracking-wider">{section}</p>
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

      </div>

      <form id="detailed-proposal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Client Information */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={User} section="Section 1" title="Client Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Client Name</label>
              <input {...register('clientName', { required: true })} className={cn("input-field", errors.clientName && "error")} placeholder="Client name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Client Type</label>
              <select 
                {...register('clientType', { required: true })} 
                className={cn("input-field bg-white outline-none border-2 border-gray-100 focus:border-[#0B07D7]", errors.clientType && "error")}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Mobile Number</label>
              <input type="tel" {...register('mobileNumber', { required: true })} className={cn("input-field", errors.mobileNumber && "error")} placeholder="Mobile number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">State / District</label>
              <input {...register('clientStateDistrict', { required: true })} className={cn("input-field", errors.clientStateDistrict && "error")} placeholder="State or District" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Date</label>
              <input type="date" {...register('date', { required: true })} className={cn("input-field", errors.date && "error")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Project ID</label>
              <input {...register('projectId', { required: true })} className={cn("input-field", errors.projectId && "error")} placeholder="Project ID" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Location Coordinates</label>
              <input {...register('locationCoordinates', { required: true })} className={cn("input-field", errors.locationCoordinates && "error")} placeholder="Location coordinates" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold text-gray-700">Address</label>
              <textarea {...register('address', { required: true })} rows={3} className={cn("input-field resize-none", errors.address && "error")} placeholder="Address" />
            </div>
          </div>
        </div>

        {/* Section 2: System Integrator */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={Building2} section="Section 2" title="System Integrator" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Company Name</label>
              <input {...register('companyName', { required: true })} className={cn("input-field", errors.companyName && "error")} placeholder="Company name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Province / State</label>
              <input {...register('provinceState', { required: true })} className={cn("input-field", errors.provinceState && "error")} placeholder="Province / State" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Project Engineer Name</label>
              <input {...register('projectEngineerName', { required: true })} className={cn("input-field", errors.projectEngineerName && "error")} placeholder="Project engineer name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Designation</label>
              <input {...register('engineerDesignation', { required: true })} className={cn("input-field", errors.engineerDesignation && "error")} placeholder="Designation" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email</label>
              <input type="email" {...register('email', { required: true })} className={cn("input-field", errors.email && "error")} placeholder="Email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Contact Number</label>
              <input type="tel" {...register('contactNumber', { required: true })} className={cn("input-field", errors.contactNumber && "error")} placeholder="Contact number" />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold text-gray-700">Company Address</label>
              <textarea {...register('companyAddress', { required: true })} rows={2} className={cn("input-field resize-none", errors.companyAddress && "error")} placeholder="Company address" />
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
                        {...register(`products.${index}.name`, { required: true })} 
                        className={cn("w-full bg-transparent font-bold text-gray-900 outline-none border-b border-transparent focus:border-[#0B07D7]", errors.products?.[index]?.name && "error")} 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input {...register(`products.${index}.brand`, { required: true })} className={cn("table-input", errors.products?.[index]?.brand && "error")} placeholder="Brand" />
                    </td>
                    <td className="px-4 py-3">
                      <input {...register(`products.${index}.specification`, { required: true })} className={cn("table-input", errors.products?.[index]?.specification && "error")} placeholder="Specification" />
                    </td>
                    <td className="px-4 py-3">
                      <input {...register(`products.${index}.warranty`, { required: true })} className={cn("table-input", errors.products?.[index]?.warranty && "error")} placeholder="Warranty" />
                    </td>
                    <td className="px-8 py-3">
                      {field.name === 'Solar Module' ? (
                        <select 
                          {...register(`products.${index}.quantity`, { required: true })} 
                          className={cn("table-input bg-white outline-none border-b border-gray-200 focus:border-[#0B07D7]", errors.products?.[index]?.quantity && "error")}
                        >
                          <option value="10 KW">10 KW</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="5 KW">5 KW</option>
                          <option value="3 KW">3 KW</option>
                        </select>
                      ) : (
                        <input {...register(`products.${index}.quantity`, { required: true })} className={cn("table-input", errors.products?.[index]?.quantity && "error")} placeholder="Quantity" />
                      )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Total Project Cost</label>
              <input type="number" {...register('totalProjectCost', { required: true })} className={cn("input-field", errors.totalProjectCost && "error")} placeholder="Enter amount" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Advance Paid</label>
              <input type="number" {...register('advancePaid')} className={cn("input-field", errors.advancePaid && "error")} placeholder="Enter advance paid" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Balance Amount</label>
              <input 
                type="number" 
                {...register('balanceAmount')} 
                readOnly 
                className="input-field bg-gray-50 border-gray-200 cursor-not-allowed text-gray-500 font-bold" 
                placeholder="Auto-calculated balance" 
              />
            </div>
          </div>
        </div>

        {/* Section 5: Warranty */}
        <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
          <SectionHeader icon={ShieldCheck} section="Section 5" title="Warranty" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Solar Module Warranty</label>
              <input {...register('solarModuleWarranty', { required: true })} className={cn("input-field", errors.solarModuleWarranty && "error")} placeholder="Solar module warranty" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Inverter Warranty</label>
              <input {...register('inverterWarranty', { required: true })} className={cn("input-field", errors.inverterWarranty && "error")} placeholder="Inverter warranty" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">ACDB / DCDB Warranty</label>
              <input {...register('acdbDcdbWarranty', { required: true })} className={cn("input-field", errors.acdbDcdbWarranty && "error")} placeholder="ACDB / DCDB warranty" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Surge Protector Warranty</label>
              <input {...register('surgeProtectorWarranty', { required: true })} className={cn("input-field", errors.surgeProtectorWarranty && "error")} placeholder="Surge protector warranty" />
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
              <input {...register('authorisedSignatory', { required: true })} className={cn("input-field", errors.authorisedSignatory && "error")} placeholder="Authorised signatory name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Date</label>
              <input type="date" {...register('signatureDate', { required: true })} className={cn("input-field", errors.signatureDate && "error")} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Remarks</label>
            <textarea {...register('remarks', { required: true })} rows={4} className={cn("input-field resize-none", errors.remarks && "error")} placeholder="Remarks" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-12">
          {Object.keys(errors).length > 0 && (
            <div className="w-full mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 animate-bounce">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-bold">Please fill in all required fields to proceed.</p>
            </div>
          )}
          
          <button
            type="button"
            onClick={handleSubmit(onDownloadPDF)}
            className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-[#0B07D7] hover:text-[#0B07D7] font-black text-lg transition-all shadow-xl shadow-gray-100"
          >
            <FileDown className="w-6 h-6" />
            Preview PDF
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-12 py-4 bg-[#0B07D7] text-white rounded-2xl hover:bg-[#0805a3] font-black text-lg shadow-2xl shadow-blue-200 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
            Submit & Save
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
          border-color: #0B07D7;
          box-shadow: 0 0 0 4px rgba(11, 7, 215, 0.05);
        }
        .input-field.error {
          border-color: #ef4444;
          background-color: #fef2f2;
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
          border-color: #0B07D7;
        }
        .table-input.error {
          border-color: #ef4444;
        }
        .input-field::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}
