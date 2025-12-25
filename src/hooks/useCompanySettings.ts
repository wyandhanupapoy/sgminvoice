import { useState, useEffect } from "react";

export interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  phone1: string;
  phone2: string;
  contactName1: string;
  contactName2: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  email: string;
  npwp: string;
  logoUrl: string;
}

const STORAGE_KEY = "company-settings";

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "PT. SUMBER GANDA MEKAR",
  tagline: "Jual Beli Besi Tua/Baru - Rangka Beton/Logam - Tiang Listrik/Telp - Konstruksi Baja dan Pakan Ternak",
  address: "Jl. Raya Gedebage No. 95 Bandung",
  phone1: "082117800626",
  phone2: "082318188863",
  contactName1: "Irwan",
  contactName2: "Uwem",
  bankName: "BANK BCA",
  bankAccount: "2801011286",
  bankHolder: "Maman Suherman",
  email: "info@sumbergandamekar.co.id",
  npwp: "",
  logoUrl: "/company-logo.png",
};

export const useCompanySettings = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_COMPANY_INFO, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading company settings:", error);
    }
    return DEFAULT_COMPANY_INFO;
  });

  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo((prev) => {
      const updated = { ...prev, ...info };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetToDefault = () => {
    setCompanyInfo(DEFAULT_COMPANY_INFO);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    companyInfo,
    updateCompanyInfo,
    resetToDefault,
  };
};

// Static getter for use in print templates (non-hook contexts)
export const getCompanyInfo = (): CompanyInfo => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_COMPANY_INFO, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error loading company settings:", error);
  }
  return DEFAULT_COMPANY_INFO;
};
