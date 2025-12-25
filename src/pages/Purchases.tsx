import StepIndicator from '@/components/shared/StepIndicator';
import PurchaseBasicInfo from '@/components/purchases/PurchaseBasicInfo';
import PurchaseAddItems from '@/components/purchases/PurchaseAddItems';
import PurchaseSummary from '@/components/purchases/PurchaseSummary';
import { usePurchaseForm } from '@/hooks/usePurchaseForm';

const steps = [
  { number: 1, label: 'Informasi Dasar' },
  { number: 2, label: 'Tambah Barang' },
  { number: 3, label: 'Ringkasan' },
];

import { motion, AnimatePresence } from 'framer-motion';

const Purchases = () => {
  const {
    currentStep,
    formData,
    errors,
    updateFormData,
    setApplyVat,
    addItem,
    removeItem,
    updateSummary,
    setNotes,
    nextStep,
    prevStep,
    resetForm,
  } = usePurchaseForm();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Buat <span className="text-gradient">Pembelian</span>
        </h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] sm:text-xs">
          Input transaksi perdagangan masuk
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
                <PurchaseBasicInfo
                  formData={formData}
                  errors={errors}
                  onUpdateFormData={updateFormData}
                  onSetApplyVat={setApplyVat}
                  onNext={nextStep}
                />
              )}

              {currentStep === 2 && (
                <PurchaseAddItems
                  items={formData.items}
                  errors={errors}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onPrev={prevStep}
                  onNext={nextStep}
                />
              )}

              {currentStep === 3 && (
                <PurchaseSummary
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

export default Purchases;
