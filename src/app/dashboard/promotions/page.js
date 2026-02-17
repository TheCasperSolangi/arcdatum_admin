"use client"
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  Gift,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('vouchers');
  const [vouchers, setVouchers] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

  // API Functions
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/vouchers`);
      const data = await response.json();
      if (data.success) {
        setVouchers(data.data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/discounts`);
      const data = await response.json();
      if (data.success) {
        setDiscounts(data.data);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVoucherAPI = async (voucherData) => {
    try {
      const response = await fetch(`${baseUrl}/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucherData),
      });
      const data = await response.json();
      if (data.success) {
        fetchVouchers(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
  };

  const updateVoucherAPI = async (id, voucherData) => {
    try {
      const response = await fetch(`${baseUrl}/vouchers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucherData),
      });
      const data = await response.json();
      if (data.success) {
        fetchVouchers(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating voucher:', error);
      throw error;
    }
  };

  const deleteVoucherAPI = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/vouchers/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchVouchers(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      throw error;
    }
  };

  const createDiscountAPI = async (discountData) => {
    try {
      const response = await fetch(`${baseUrl}/discounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData),
      });
      const data = await response.json();
      if (data.success) {
        fetchDiscounts(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  };

  const updateDiscountAPI = async (id, discountData) => {
    try {
      const response = await fetch(`${baseUrl}/discounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData),
      });
      const data = await response.json();
      if (data.success) {
        fetchDiscounts(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  };

  const deleteDiscountAPI = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/discounts/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchDiscounts(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw error;
    }
  };

  const toggleDiscountStatusAPI = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/discounts/${id}/toggle-status`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (data.success) {
        fetchDiscounts(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error toggling discount status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchDiscounts();
  }, []);

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.voucher_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.discount_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (discount.product_id && discount.product_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || discount.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const CreateVoucherForm = ({ onClose, voucher = null }) => {
    const [formData, setFormData] = useState({
      voucher_code: voucher?.voucher_code || '',
      voucher_type: voucher?.voucher_type || 'promotion_voucher',
      pricing_type: voucher?.pricing_type || 'fixed',
      voucher_value: voucher?.voucher_value || '',
      start_date: voucher?.start_date || '',
      end_date: voucher?.end_date || '',
      max_attempts: voucher?.max_attempts || '',
      is_capped: voucher?.is_capped || 'false',
      capped_amount: voucher?.capped_amount || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (voucher) {
          await updateVoucherAPI(voucher._id, formData);
        } else {
          await createVoucherAPI(formData);
        }
        onClose();
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-black">
            {voucher ? 'Edit Voucher' : 'Create New Voucher'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Voucher Code</label>
              <input
                type="text"
                value={formData.voucher_code}
                onChange={(e) => setFormData({...formData, voucher_code: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Voucher Type</label>
              <select
                value={formData.voucher_type}
                onChange={(e) => setFormData({...formData, voucher_type: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              >
                <option value="promotion_voucher">Promotion Voucher</option>
                <option value="single-user-voucher">Single User Voucher</option>
                <option value="limited-voucher">Limited Voucher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Pricing Type</label>
              <select
                value={formData.pricing_type}
                onChange={(e) => setFormData({...formData, pricing_type: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              >
                <option value="fixed">Fixed</option>
                <option value="discounted">Discounted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Voucher Value</label>
              <input
                type="number"
                value={formData.voucher_value}
                onChange={(e) => setFormData({...formData, voucher_value: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                required
              />
            </div>

            {(formData.voucher_type === 'promotion_voucher') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  />
                </div>
              </>
            )}

            {formData.voucher_type === 'limited-voucher' && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">Max Attempts</label>
                <input
                  type="number"
                  value={formData.max_attempts}
                  onChange={(e) => setFormData({...formData, max_attempts: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black mb-1">Is Capped</label>
              <select
                value={formData.is_capped}
                onChange={(e) => setFormData({...formData, is_capped: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {formData.is_capped === 'true' && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">Capped Amount</label>
                <input
                  type="number"
                  value={formData.capped_amount}
                  onChange={(e) => setFormData({...formData, capped_amount: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
              >
                {voucher ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-black py-2 px-4 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CreateDiscountForm = ({ onClose, discount = null }) => {
    const [formData, setFormData] = useState({
      discount_type: discount?.discount_type || 'campaign',
      product_id: discount?.product_id || '',
      discount_method: discount?.discount_method || 'percentage',
      value: discount?.value || '',
      start_date: discount?.start_date || '',
      end_date: discount?.end_date || '',
      status: discount?.status || 'active',
      is_capped: discount?.is_capped || 0,
      capped_amount: discount?.capped_amount || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (discount) {
          await updateDiscountAPI(discount._id, formData);
        } else {
          await createDiscountAPI(formData);
        }
        onClose();
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-black">
            {discount ? 'Edit Discount' : 'Create New Discount'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              >
                <option value="campaign">Campaign</option>
                <option value="product">Product</option>
              </select>
            </div>

            {formData.discount_type === 'product' && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">Product ID</label>
                <input
                  type="text"
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black mb-1">Discount Method</label>
              <select
                value={formData.discount_method}
                onChange={(e) => setFormData({...formData, discount_method: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Value {formData.discount_method === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                required
                max={formData.discount_method === 'percentage' ? 100 : undefined}
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Is Capped</label>
              <select
                value={formData.is_capped}
                onChange={(e) => setFormData({...formData, is_capped: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            {formData.is_capped === 1 && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">Capped Amount</label>
                <input
                  type="number"
                  value={formData.capped_amount}
                  onChange={(e) => setFormData({...formData, capped_amount: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                  required
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
              >
                {discount ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-black py-2 px-4 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const deleteItem = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'voucher') {
          await deleteVoucherAPI(id);
        } else {
          await deleteDiscountAPI(id);
        }
      } catch (error) {
        alert(`Error deleting item: ${error.message}`);
      }
    }
  };

  const toggleDiscountStatus = async (id) => {
    try {
      await toggleDiscountStatusAPI(id);
    } catch (error) {
      alert(`Error toggling status: ${error.message}`);
    }
  };

  const stats = {
    totalVouchers: vouchers.length,
    totalDiscounts: discounts.length,
    activeDiscounts: discounts.filter(d => d.status === 'active').length,
    voucherValue: vouchers.reduce((sum, v) => sum + (v.voucher_value || 0), 0)
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">Promotion Management</h1>
        <p className="text-gray-600">Manage your vouchers and discounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vouchers</p>
              <p className="text-2xl font-bold text-black">{stats.totalVouchers}</p>
            </div>
            <Gift className="w-8 h-8 text-black" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Discounts</p>
              <p className="text-2xl font-bold text-black">{stats.totalDiscounts}</p>
            </div>
            <Percent className="w-8 h-8 text-black" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Discounts</p>
              <p className="text-2xl font-bold text-black">{stats.activeDiscounts}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-black" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Voucher Value</p>
              <p className="text-2xl font-bold text-black">${stats.voucherValue}</p>
            </div>
            <DollarSign className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vouchers'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
            }`}
          >
            Vouchers
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discounts'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
            }`}
          >
            Discounts
          </button>
        </nav>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black"
          />
        </div>
        
        {activeTab === 'discounts' && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-black"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        )}

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'vouchers' ? 'Voucher' : 'Discount'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-black text-lg">Loading...</div>
        </div>
      ) : activeTab === 'vouchers' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVouchers.map((voucher) => (
                  <tr key={voucher._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-black mr-2" />
                        <span className="text-sm font-medium text-black">{voucher.voucher_code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-black">
                        {voucher.voucher_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      ${voucher.voucher_value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {voucher.pricing_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {voucher.start_date && voucher.end_date 
                        ? `${voucher.start_date} - ${voucher.end_date}`
                        : 'No expiry'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditItem(voucher);
                            setShowCreateModal(true);
                          }}
                          className="text-black hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(voucher._id, 'voucher')}
                          className="text-black hover:text-gray-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVouchers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No vouchers found
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-black">
                        {discount.discount_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {discount.discount_method === 'percentage' ? (
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 mr-1" />
                          {discount.value}%
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {discount.value}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {discount.discount_method === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {discount.product_id || 'All Products'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleDiscountStatus(discount._id)}
                        className="flex items-center"
                      >
                        {discount.status === 'active' ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-green-600 mr-1" />
                            <span className="text-green-600 text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-gray-400 mr-1" />
                            <span className="text-gray-400 text-sm">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditItem(discount);
                            setShowCreateModal(true);
                          }}
                          className="text-black hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(discount._id, 'discount')}
                          className="text-black hover:text-gray-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDiscounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No discounts found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && activeTab === 'vouchers' && (
        <CreateVoucherForm
          onClose={() => {
            setShowCreateModal(false);
            setEditItem(null);
          }}
          voucher={editItem}
        />
      )}

      {showCreateModal && activeTab === 'discounts' && (
        <CreateDiscountForm
          onClose={() => {
            setShowCreateModal(false);
            setEditItem(null);
          }}
          discount={editItem}
        />
      )}
    </div>
  );
};

export default Dashboard;