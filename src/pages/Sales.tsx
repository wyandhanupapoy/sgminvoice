import StepIndicator from '@/components/shared/StepIndicator';
import SalesBasicInfo from '@/components/sales/SalesBasicInfo';
import SalesAddItems from '@/components/sales/SalesAddItems';
import SalesSummary from '@/components/sales/SalesSummary';
import { useSalesForm } from '@/hooks/useSalesForm';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { number: 1, label: 'Informasi Dasar' },
  { number: 2, label: 'Tambah Barang' },
  { number: 3, label: 'Ringkasan' },
];

const Sales = () => {
  const {
    currentStep,
    formData,
    errors,
    updateFormData,
    setApplyVat,
    setVatExempt,
    addItem,
    removeItem,
    updateSummary,
    setNotes,
    nextStep,
    prevStep,
    resetForm,
  } = useSalesForm();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Buat <span className="text-gradient">Penjualan</span>
        </h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] sm:text-xs">
          Input transaksi perdagangan keluar
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <StepIndicator steps={steps} currentStep={currentStep} />
        
        <div className="mt-8 sm:mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <SalesBasicInfo
                  formData={formData}
                  errors={errors}
                  onUpdateFormData={updateFormData}
                  onSetApplyVat={setApplyVat}
                  onSetVatExempt={setVatExempt}
                  onNext={nextStep}
                />
              )}

              {currentStep === 2 && (
                <SalesAddItems
                  items={formData.items}
                  errors={errors}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onPrev={prevStep}
                  onNext={nextStep}
                />
              )}

              {currentStep === 3 && (
                <SalesSummary
                  formData={formData}
                  onUpdateSummary={updateSummary}
                  onRemoveItem={removeItem}
                  onSetNotes={setNotes}
                  onPrev={prevStep}
                  onReset={resetForm}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Sales;
