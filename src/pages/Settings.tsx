import { useState, useMemo, useEffect } from "react";
import {
  Save,
  Building2,
  Percent,
  Package,
  Users,
  Truck,
  Upload,
  Plus,
  Trash2,
  Pencil,
  Search,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useItems, Item } from "@/hooks/useItems";
import { useCustomers, Customer } from "@/hooks/useCustomers";
import { useSuppliers, Supplier } from "@/hooks/useSuppliers";
import { formatRupiah } from "@/utils/formatters";
import CurrencyInput from "@/components/shared/CurrencyInput";
import EditItemDialog from "@/components/settings/EditItemDialog";
import EditCustomerDialog from "@/components/settings/EditCustomerDialog";
import EditSupplierDialog from "@/components/settings/EditSupplierDialog";
import DeleteConfirmDialog from "@/components/settings/DeleteConfirmDialog";
import BackupRestoreSection from "@/components/settings/BackupRestoreSection";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/shared/Pagination";

const Settings = () => {
  const { toast } = useToast();
  const { items, addItem, addItemsBulk, updateItem, deleteItem } = useItems();
  const { customers, addCustomer, addCustomersBulk, updateCustomer, deleteCustomer } = useCustomers();
  const { suppliers, addSupplier, addSuppliersBulk, updateSupplier, deleteSupplier } = useSuppliers();

  // Search filters
  const [itemSearch, setItemSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  // Filtered data
  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return items;
    const search = itemSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.item_code.toLowerCase().includes(search) ||
        item.item_name.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search)),
    );
  }, [items, itemSearch]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const search = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.phone && c.phone.toLowerCase().includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search)) ||
        (c.npwp && c.npwp.toLowerCase().includes(search)),
    );
  }, [customers, customerSearch]);

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers;
    const search = supplierSearch.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        (s.phone && s.phone.toLowerCase().includes(search)) ||
        (s.email && s.email.toLowerCase().includes(search)),
    );
  }, [suppliers, supplierSearch]);

  // Pagination
  const itemsPagination = usePagination({ data: filteredItems, itemsPerPage: 10 });
  const customersPagination = usePagination({ data: filteredCustomers, itemsPerPage: 10 });
  const suppliersPagination = usePagination({ data: filteredSuppliers, itemsPerPage: 10 });

  // Reset pagination when search changes
  useEffect(() => {
    itemsPagination.resetPage();
  }, [itemSearch]);
  useEffect(() => {
    customersPagination.resetPage();
  }, [customerSearch]);
  useEffect(() => {
    suppliersPagination.resetPage();
  }, [supplierSearch]);

  // Edit dialogs
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Delete dialogs
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null);

  // Company settings
  const [companySettings, setCompanySettings] = useState({
    name: "PT. Sumber Ganda Mekar",
    tagline: "Jual Beli Besi Tua/Baru - Rangka Beton/Logam - Tiang Listrik/Telp - Konstruksi Baja dan Pakan Ternak",
    address: "Jl. Gedebage Selatan No.92-95, Cisaranten Kidul, Kec. Gedebage, Kota Bandung, Jawa Barat 40295",
    phone: "(022) 7536459",
    email: "sumbergandamekar@gmail.com",
    npwp: "",
  });

  // New item form
  const [newItem, setNewItem] = useState({
    item_code: "",
    item_name: "",
    unit: "Pcs",
    unit_price: 0,
    stock: 0,
    description: "",
  });

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    address: "",
    phone: "",
    npwp: "",
    email: "",
  });

  // New supplier form
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  // JSON import
  const [itemsJson, setItemsJson] = useState("");
  const [customersJson, setCustomersJson] = useState("");
  const [suppliersJson, setSuppliersJson] = useState("");

  const handleAddItem = async () => {
    if (!newItem.item_code || !newItem.item_name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Kode dan nama barang wajib diisi",
      });
      return;
    }

    await addItem(newItem as Omit<Item, "id">);
    setNewItem({
      item_code: "",
      item_name: "",
      unit: "Pcs",
      unit_price: 0,
      stock: 0,
      description: "",
    });
  };

  const handleImportItems = async () => {
    try {
      const parsed = JSON.parse(itemsJson);
      const itemsArray = Array.isArray(parsed) ? parsed : [parsed];

      const validItems = itemsArray.map((item) => ({
        item_code: item.item_code || item.kode || "",
        item_name: item.item_name || item.nama || "",
        unit: item.unit || item.satuan || "Pcs",
        unit_price: Number(item.unit_price || item.harga || 0),
        stock: Number(item.stock || item.stok || 0),
        description: item.description || item.deskripsi || null,
      }));

      await addItemsBulk(validItems);
      setItemsJson("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Format JSON tidak valid",
      });
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama pelanggan wajib diisi",
      });
      return;
    }

    await addCustomer(newCustomer as Omit<Customer, "id">);
    setNewCustomer({
      name: "",
      address: "",
      phone: "",
      npwp: "",
      email: "",
    });
  };

  const handleImportCustomers = async () => {
    try {
      const parsed = JSON.parse(customersJson);
      const customersArray = Array.isArray(parsed) ? parsed : [parsed];

      const validCustomers = customersArray.map((c) => ({
        name: c.name || c.nama || "",
        address: c.address || c.alamat || null,
        phone: c.phone || c.telepon || null,
        npwp: c.npwp || null,
        email: c.email || null,
      }));

      await addCustomersBulk(validCustomers);
      setCustomersJson("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Format JSON tidak valid",
      });
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nama supplier wajib diisi",
      });
      return;
    }

    await addSupplier(newSupplier as Omit<Supplier, "id">);
    setNewSupplier({
      name: "",
      address: "",
      phone: "",
      email: "",
    });
  };

  const handleImportSuppliers = async () => {
    try {
      const parsed = JSON.parse(suppliersJson);
      const suppliersArray = Array.isArray(parsed) ? parsed : [parsed];

      const validSuppliers = suppliersArray.map((s) => ({
        name: s.name || s.nama || "",
        address: s.address || s.alamat || null,
        phone: s.phone || s.telepon || null,
        email: s.email || null,
      }));

      await addSuppliersBulk(validSuppliers);
      setSuppliersJson("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Format JSON tidak valid",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (deleteItemId) {
      await deleteItem(deleteItemId);
      setDeleteItemId(null);
    }
  };

  const handleDeleteCustomer = async () => {
    if (deleteCustomerId) {
      await deleteCustomer(deleteCustomerId);
      setDeleteCustomerId(null);
    }
  };

  const handleDeleteSupplier = async () => {
    if (deleteSupplierId) {
      await deleteSupplier(deleteSupplierId);
      setDeleteSupplierId(null);
    }
  };

  const handleSave = () => {
    toast({
      title: "Pengaturan Disimpan",
      description: "Perubahan pengaturan berhasil disimpan.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan sistem, data master barang, pelanggan, dan supplier</p>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="items" className="gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Barang</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Pelanggan</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Supplier</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Perusahaan</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-2">
            <Percent className="w-4 h-4" />
            <span className="hidden sm:inline">Pajak</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items">
          <div className="space-y-6">
            {/* Add Item Form */}
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-4">Tambah Barang Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Kode Barang *</Label>
                  <Input
                    value={newItem.item_code}
                    onChange={(e) => setNewItem({ ...newItem, item_code: e.target.value })}
                    placeholder="STL-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Barang *</Label>
                  <Input
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    placeholder="Besi Beton 10mm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Satuan</Label>
                  <Input
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="Pcs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Harga Satuan</Label>
                  <CurrencyInput
                    value={newItem.unit_price}
                    onChange={(value) => setNewItem({ ...newItem, unit_price: value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input
                    type="number"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Input
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Keterangan tambahan"
                  />
                </div>
              </div>
              <Button onClick={handleAddItem} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Tambah Barang
              </Button>
            </div>

            {/* Import JSON */}
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-4">Import dari JSON</h3>
              <Textarea
                value={itemsJson}
                onChange={(e) => setItemsJson(e.target.value)}
                placeholder='[{"item_code": "STL-001", "item_name": "Besi Beton 10mm", "unit": "Batang", "unit_price": 50000, "stock": 100}]'
                rows={4}
                className="font-mono text-sm"
              />
              <Button onClick={handleImportItems} className="mt-4 gap-2" variant="outline">
                <Upload className="w-4 h-4" />
                Import JSON
              </Button>
            </div>

            {/* Items List */}
            <div className="form-section">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold">
                  Daftar Barang ({filteredItems.length} dari {items.length})
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Cari kode atau nama..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Kode</th>
                        <th>Nama</th>
                        <th className="hidden sm:table-cell">Satuan</th>
                        <th className="text-right">Harga</th>
                        <th className="text-right hidden md:table-cell">Stok</th>
                        <th className="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsPagination.paginatedData.map((item) => (
                        <tr key={item.id}>
                          <td className="font-mono text-[10px] sm:text-xs">{item.item_code}</td>
                          <td className="max-w-[120px] truncate text-[10px] sm:text-xs">{item.item_name}</td>
                          <td className="hidden sm:table-cell text-[10px] sm:text-xs">{item.unit}</td>
                          <td className="text-right font-mono text-[10px] sm:text-xs whitespace-nowrap">{formatRupiah(item.unit_price)}</td>
                          <td className="text-right hidden md:table-cell text-[10px] sm:text-xs">{item.stock}</td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(item)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteItemId(item.id)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-muted-foreground">
                            {items.length === 0
                              ? "Belum ada data barang"
                              : "Tidak ada barang yang cocok dengan pencarian"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                currentPage={itemsPagination.currentPage}
                totalPages={itemsPagination.totalPages}
                onPageChange={itemsPagination.goToPage}
                startIndex={itemsPagination.startIndex}
                endIndex={itemsPagination.endIndex}
                totalItems={itemsPagination.totalItems}
              />
            </div>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="space-y-6">
            {/* Add Customer Form */}
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-4">Tambah Pelanggan Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Pelanggan *</Label>
                  <Input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="PT. Contoh Jaya"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Alamat</Label>
                  <Textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    placeholder="Alamat lengkap"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>NPWP</Label>
                  <Input
                    value={newCustomer.npwp}
                    onChange={(e) => setNewCustomer({ ...newCustomer, npwp: e.target.value })}
                    placeholder="XX.XXX.XXX.X-XXX.XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <Button onClick={handleAddCustomer} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Tambah Pelanggan
              </Button>
            </div>

            {/* Import JSON */}
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-4">Import dari JSON</h3>
              <Textarea
                value={customersJson}
                onChange={(e) => setCustomersJson(e.target.value)}
                placeholder='[{"name": "PT. Contoh Jaya", "address": "Jl. Raya No. 1", "phone": "08123456789", "npwp": "01.234.567.8-012.345"}]'
                rows={4}
                className="font-mono text-sm"
              />
              <Button onClick={handleImportCustomers} className="mt-4 gap-2" variant="outline">
                <Upload className="w-4 h-4" />
                Import JSON
              </Button>
            </div>

            {/* Customers List */}
            <div className="form-section">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold">
                  Daftar Pelanggan ({filteredCustomers.length} dari {customers.length})
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Cari nama, telepon, email..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th className="hidden md:table-cell">Telepon</th>
                        <th className="hidden lg:table-cell">Email</th>
                        <th className="hidden xl:table-cell">NPWP</th>
                        <th className="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersPagination.paginatedData.map((customer) => (
                        <tr key={customer.id}>
                          <td className="max-w-[150px] truncate text-[10px] sm:text-xs">{customer.name}</td>
                          <td className="hidden md:table-cell text-[10px] sm:text-xs">{customer.phone || "-"}</td>
                          <td className="hidden lg:table-cell text-[10px] sm:text-xs max-w-[150px] truncate">{customer.email || "-"}</td>
                          <td className="hidden xl:table-cell font-mono text-[10px] sm:text-xs">{customer.npwp || "-"}</td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCustomer(customer)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteCustomerId(customer.id)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            {customers.length === 0
                              ? "Belum ada data pelanggan"
                              : "Tidak ada pelanggan yang cocok dengan pencarian"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                currentPage={customersPagination.currentPage}
                totalPages={customersPagination.totalPages}
                onPageChange={customersPagination.goToPage}
                startIndex={customersPagination.startIndex}
                endIndex={customersPagination.endIndex}
                totalItems={customersPagination.totalItems}
              />
            </div>
          </div>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <div className="space-y-6">
            {/* Add Supplier Form */}
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-4">Tambah Supplier Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Supplier *</Label>
                  <Input
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    placeholder="CV. Baja Perkasa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Alamat</Label>
                  <Textarea
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    placeholder="Alamat lengkap"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <Button onClick={handleAddSupplier} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Tambah Supplier
              </Button>
            </div>

            {/* Import JSON */}
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-4">Import dari JSON</h3>
              <Textarea
                value={suppliersJson}
                onChange={(e) => setSuppliersJson(e.target.value)}
                placeholder='[{"name": "CV. Baja Perkasa", "address": "Jl. Industri No. 10", "phone": "08123456789"}]'
                rows={4}
                className="font-mono text-sm"
              />
              <Button onClick={handleImportSuppliers} className="mt-4 gap-2" variant="outline">
                <Upload className="w-4 h-4" />
                Import JSON
              </Button>
            </div>

            {/* Suppliers List */}
            <div className="form-section">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold">
                  Daftar Supplier ({filteredSuppliers.length} dari {suppliers.length})
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    placeholder="Cari nama, telepon, email..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th className="hidden md:table-cell">Telepon</th>
                        <th className="hidden lg:table-cell">Email</th>
                        <th className="hidden xl:table-cell">Alamat</th>
                        <th className="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliersPagination.paginatedData.map((supplier) => (
                        <tr key={supplier.id}>
                          <td className="max-w-[150px] truncate text-[10px] sm:text-xs">{supplier.name}</td>
                          <td className="hidden md:table-cell text-[10px] sm:text-xs">{supplier.phone || "-"}</td>
                          <td className="hidden lg:table-cell text-[10px] sm:text-xs max-w-[150px] truncate">{supplier.email || "-"}</td>
                          <td className="hidden xl:table-cell max-w-xs truncate text-[10px] sm:text-xs">{supplier.address || "-"}</td>
                          <td className="text-center">
                            <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSupplier(supplier)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteSupplierId(supplier.id)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredSuppliers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            {suppliers.length === 0
                              ? "Belum ada data supplier"
                              : "Tidak ada supplier yang cocok dengan pencarian"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                currentPage={suppliersPagination.currentPage}
                totalPages={suppliersPagination.totalPages}
                onPageChange={suppliersPagination.goToPage}
                startIndex={suppliersPagination.startIndex}
                endIndex={suppliersPagination.endIndex}
                totalItems={suppliersPagination.totalItems}
              />
            </div>
          </div>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company">
          <div className="form-section space-y-6">
            <h3 className="text-lg font-semibold">Informasi Perusahaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nama Perusahaan</Label>
                <Input
                  id="companyName"
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Telepon</Label>
                <Input
                  id="companyPhone"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyTagline">Tagline</Label>
                <Input
                  id="companyTagline"
                  value={companySettings.tagline}
                  onChange={(e) => setCompanySettings({ ...companySettings, tagline: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyAddress">Alamat</Label>
                <Textarea
                  id="companyAddress"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyNpwp">NPWP</Label>
                <Input
                  id="companyNpwp"
                  value={companySettings.npwp}
                  onChange={(e) => setCompanySettings({ ...companySettings, npwp: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </Button>
          </div>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax">
          <div className="form-section space-y-6">
            <h3 className="text-lg font-semibold">Pengaturan Pajak</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">PPN (Pajak Pertambahan Nilai)</p>
                  <p className="text-sm text-muted-foreground">Tarif PPN standar 11%</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">11%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">PPh (Pajak Penghasilan)</p>
                  <p className="text-sm text-muted-foreground">Tarif PPh Badan</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">22%</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              * Tarif pajak mengikuti peraturan perpajakan yang berlaku di Indonesia.
            </p>
          </div>
        </TabsContent>

        {/* Backup & Restore Tab */}
        <TabsContent value="backup">
          <BackupRestoreSection />
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      <EditItemDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSave={updateItem}
      />
      <EditCustomerDialog
        customer={editingCustomer}
        open={!!editingCustomer}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
        onSave={updateCustomer}
      />
      <EditSupplierDialog
        supplier={editingSupplier}
        open={!!editingSupplier}
        onOpenChange={(open) => !open && setEditingSupplier(null)}
        onSave={updateSupplier}
      />

      {/* Delete Confirmation Dialogs */}
      <DeleteConfirmDialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
        onConfirm={handleDeleteItem}
        title="Hapus Barang"
        description="Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan."
      />
      <DeleteConfirmDialog
        open={!!deleteCustomerId}
        onOpenChange={(open) => !open && setDeleteCustomerId(null)}
        onConfirm={handleDeleteCustomer}
        title="Hapus Pelanggan"
        description="Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan."
      />
      <DeleteConfirmDialog
        open={!!deleteSupplierId}
        onOpenChange={(open) => !open && setDeleteSupplierId(null)}
        onConfirm={handleDeleteSupplier}
        title="Hapus Supplier"
        description="Apakah Anda yakin ingin menghapus supplier ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default Settings;
