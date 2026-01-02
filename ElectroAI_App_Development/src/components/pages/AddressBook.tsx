import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Check, MapPin, Home, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AddressBookProps {
  onBack: () => void;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  detailedAddress?: string; // Tách ra để form dễ xử lý
  city?: string;
  district?: string;
  ward?: string;
  isDefault: boolean;
  type: 'Nhà riêng' | 'Văn phòng';
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    detailedAddress: '123 Đường Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
    type: 'Nhà riêng'
  },
  {
    id: 2,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: 'Toà nhà TechHub, 456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    detailedAddress: 'Toà nhà TechHub, 456 Đường Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
    type: 'Văn phòng'
  }
];

export function AddressBook({ onBack }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Address>>({
    name: '',
    phone: '',
    detailedAddress: '',
    ward: '',
    district: '',
    city: '',
    type: 'Nhà riêng',
    isDefault: false
  });

  const handleSetDefault = (id: number) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      detailedAddress: '',
      ward: '',
      district: '',
      city: '',
      type: 'Nhà riêng',
      isDefault: addresses.length === 0 // Nếu chưa có địa chỉ nào thì mặc định là true
    });
    setIsFormOpen(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({ ...addr });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    // Validate simple
    if (!formData.name || !formData.phone || !formData.detailedAddress) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const fullAddress = `${formData.detailedAddress}, ${formData.ward}, ${formData.district}, ${formData.city}`;
    
    if (editingId) {
      // Update existing
      setAddresses(prev => prev.map(addr => {
        if (addr.id === editingId) {
            return {
                ...addr,
                ...formData,
                address: fullAddress,
            } as Address;
        }
        // Nếu cái đang sửa được set là default, các cái khác phải bỏ default
        if (formData.isDefault) {
            return { ...addr, isDefault: false };
        }
        return addr;
      }));
    } else {
      // Add new
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      const newAddress = {
        ...formData,
        id: newId,
        address: fullAddress,
      } as Address;

      if (newAddress.isDefault) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddress));
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }
    }
    setIsFormOpen(false);
  };

  if (isFormOpen) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
        <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold flex-1">{editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h1>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="grid grid-cols-1 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tỉnh / Thành phố</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập Tỉnh/Thành phố"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quận / Huyện</label>
                    <input 
                    type="text" 
                    value={formData.district}
                    onChange={e => setFormData({...formData, district: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Quận/Huyện"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phường / Xã</label>
                    <input 
                    type="text" 
                    value={formData.ward}
                    onChange={e => setFormData({...formData, ward: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phường/Xã"
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ cụ thể</label>
                <input 
                  type="text" 
                  value={formData.detailedAddress}
                  onChange={e => setFormData({...formData, detailedAddress: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Số nhà, tên đường..."
                />
              </div>
            </div>

            <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại địa chỉ</label>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setFormData({...formData, type: 'Nhà riêng'})}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                            formData.type === 'Nhà riêng' 
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        )}
                    >
                        <Home size={16} /> Nhà riêng
                    </button>
                    <button 
                        onClick={() => setFormData({...formData, type: 'Văn phòng'})}
                        className={cn(
                            "flex-1 py-2 px-4 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                            formData.type === 'Văn phòng' 
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        )}
                    >
                        <Briefcase size={16} /> Văn phòng
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <button 
                    onClick={() => setFormData({...formData, isDefault: !formData.isDefault})}
                    className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        formData.isDefault ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 dark:border-gray-600"
                    )}
                >
                    {formData.isDefault && <Check size={14} />}
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">Đặt làm địa chỉ mặc định</span>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98] transition-transform"
          >
            Lưu địa chỉ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
      <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1">Sổ địa chỉ</h1>
        <button onClick={openAddForm} className="text-blue-600 font-medium text-sm">
          <Plus size={24} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className={cn(
            "bg-white dark:bg-gray-900 p-4 rounded-xl border shadow-sm transition-all",
            addr.isDefault ? "border-blue-200 dark:border-blue-900 ring-1 ring-blue-100 dark:ring-blue-900" : "border-gray-100 dark:border-gray-800"
          )}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-gray-100">{addr.name}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">{addr.phone}</span>
              </div>
              {addr.isDefault ? (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-medium">Mặc định</span>
              ) : (
                <button 
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[10px] text-gray-400 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 hover:text-gray-600 transition-colors"
                >
                    Đặt mặc định
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
              {addr.address}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1">
                {addr.type === 'Nhà riêng' ? <Home size={10} /> : <Briefcase size={10} />}
                {addr.type}
              </span>
              <div className="flex gap-4">
                <button 
                    onClick={() => openEditForm(addr)}
                    className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
                >
                  <Edit2 size={14} /> Sửa
                </button>
                <button 
                    onClick={() => handleDelete(addr.id)}
                    className="text-sm text-red-500 font-medium flex items-center gap-1 hover:text-red-600"
                >
                    <Trash2 size={14} /> Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <button 
            onClick={openAddForm}
            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <Plus size={20} />
          Thêm địa chỉ mới
        </button>
      </div>
    </div>
  );
}