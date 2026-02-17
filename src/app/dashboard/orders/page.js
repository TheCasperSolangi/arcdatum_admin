'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  CreditCard, 
  FileText, 
  Search,
  Filter,
  RefreshCw,
  Package,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPageOrders, setCurrentPageOrders] = useState([]);
  const [alert, setAlert] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 25;
  
  const token = Cookies.get('token');
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
  const AUTH_TOKEN = token ? `Bearer ${token}` : null;

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        headers: { Authorization: AUTH_TOKEN }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.data || []);
        setFilteredOrders(data.data || []);
        setCurrentPage(1); // Reset to first page when orders change
      } else {
        showAlert('error', data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      showAlert('error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderCode, status) => {
    try {
      const response = await fetch(`${API_BASE}/${orderCode}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_TOKEN
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (response.ok) {
        showAlert('success', 'Order status updated successfully');
        fetchOrders();
        setEditStatusOpen(false);
      } else {
        showAlert('error', data.message || 'Failed to update status');
      }
    } catch (error) {
      showAlert('error', 'Network error occurred');
    }
  };

  // Mark order as paid
  const markOrderPaid = async (orderCode) => {
    try {
      const response = await fetch(`${API_BASE}/${orderCode}/mark_paid`, {
        method: 'PUT',
        headers: { Authorization: AUTH_TOKEN }
      });
      const data = await response.json();
      if (response.ok) {
        showAlert('success', 'Order marked as paid');
        fetchOrders();
      } else {
        showAlert('error', data.message || 'Failed to mark as paid');
      }
    } catch (error) {
      showAlert('error', 'Network error occurred');
    }
  };

  // Delete order
  const deleteOrder = async (orderCode) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/${orderCode}`, {
        method: 'DELETE',
        headers: { Authorization: AUTH_TOKEN }
      });
      const data = await response.json();
      if (response.ok) {
        showAlert('success', 'Order deleted successfully');
        fetchOrders();
      } else {
        showAlert('error', data.message || 'Failed to delete order');
      }
    } catch (error) {
      showAlert('error', 'Network error occurred');
    }
  };

  // Generate invoice
  const generateInvoice = async (orderCode) => {
    try {
      const response = await fetch(`${API_BASE}/${orderCode}/generate_invoice`, {
        headers: { Authorization: AUTH_TOKEN }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showAlert('success', 'Invoice downloaded successfully');
      } else {
        showAlert('error', 'Failed to generate invoice');
      }
    } catch (error) {
      showAlert('error', 'Network error occurred');
    }
  };

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, searchTerm, statusFilter]);

  // Update current page orders when filteredOrders or currentPage changes
  useEffect(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setCurrentPageOrders(filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder));
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / ordersPerPage)));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      processing: { variant: 'default', icon: Package, color: 'text-blue-600' },
      shipped: { variant: 'outline', icon: Truck, color: 'text-purple-600' },
      delivered: { variant: 'default', icon: CheckCircle2, color: 'text-green-600' },
      cancelled: { variant: 'destructive', icon: XCircle, color: 'text-red-600' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + (order.total || 0), 0)
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Order Management System
          </h1>
          <p className="text-gray-600 text-lg">Manage and track all customer orders efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Orders</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Pending</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Processing</p>
                  <p className="text-3xl font-bold">{stats.processing}</p>
                </div>
                <Truck className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Delivered</p>
                  <p className="text-3xl font-bold">{stats.delivered}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Revenue</p>
                  <p className="text-3xl font-bold">${stats.revenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Orders Dashboard
              </CardTitle>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 min-w-[200px]"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="min-w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={fetchOrders} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {alert && (
              <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p>Loading orders...</p>
                      </td>
                    </tr>
                  ) : currentPageOrders.length > 0 ? (
                    currentPageOrders.map((order, index) => (
                      <tr key={order._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-6 py-4 font-mono font-medium">{order.order_code}</td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 font-semibold">${order.total?.toFixed(2)}</td>
                        <td className="px-6 py-4 capitalize">{order.payment_method}</td>
                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Details */}
                            <Dialog open={open && selectedOrder?._id === order._id} onOpenChange={setOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setOpen(true);
                                  }}
                                  className="hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                            </Dialog>

                            {/* Edit Status */}
                            <Dialog open={editStatusOpen && selectedOrder?._id === order._id} onOpenChange={setEditStatusOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus(order.status);
                                    setEditStatusOpen(true);
                                  }}
                                  className="hover:bg-yellow-50"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                            </Dialog>

                            {/* Mark as Paid */}
                            {order.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markOrderPaid(order.order_code)}
                                className="hover:bg-green-50"
                              >
                                <CreditCard className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Generate Invoice */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateInvoice(order.order_code)}
                              className="hover:bg-purple-50"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>

                            {/* Delete Order */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteOrder(order.order_code)}
                              className="hover:bg-red-50 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No orders found</p>
                        <p className="text-sm">Orders will appear here once customers place them</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredOrders.length > ordersPerPage && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * ordersPerPage + 1} to{' '}
                  {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of{' '}
                  {filteredOrders.length} orders
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                        onClick={() => paginate(i + 1)}
                        className="w-10 h-10 p-0"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Order Details - {selectedOrder.order_code}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-lg">${selectedOrder.total?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Payment Method:</span>
                        <span className="capitalize">{selectedOrder.payment_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Order Date:</span>
                        <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Addresses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium mb-1">Billing Address:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {selectedOrder.billing_address}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Shipping Address:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {selectedOrder.shipping_address}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedOrder.special_instructions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Special Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {selectedOrder.special_instructions}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Product</th>
                          <th className="text-left py-2">Quantity</th>
                          <th className="text-left py-2">Price</th>
                          <th className="text-left py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item) => (
                          <tr key={item._id} className="border-b">
                            <td className="py-2 font-medium">
                              {item.product_id?.product_name || 'Unknown Product'}
                            </td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">${item.price?.toFixed(2)}</td>
                            <td className="py-2 font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Status Dialog */}
        {selectedOrder && (
          <Dialog open={editStatusOpen} onOpenChange={setEditStatusOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Order Status - {selectedOrder.order_code}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select New Status:</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditStatusOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder.order_code, newStatus)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}