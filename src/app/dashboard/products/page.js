'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Plus, Edit3, Trash2, Filter, SortAsc, Package, Star, Eye } from 'lucide-react';
import Cookies from 'js-cookie';

const EMPTY_PRODUCT = {
  product_sku: '',
  product_code: '',
  product_name: '',
  category_code: '',
  price: '',
  stock: '',
  is_featured: false,
  short_description: '',
  long_description: '',
  features: [],
};

// ProductDialog component moved outside the main component
const ProductDialog = ({ 
  isOpen, 
  onOpenChange, 
  isEdit = false, 
  newProduct, 
  setNewProduct, 
  categories, 
  categoriesLoading, 
  categoriesError, 
  selectedFiles, 
  setSelectedFiles, 
  uploading, 
  handleInputChange, 
  updateFeature, 
  removeFeature, 
  addFeature, 
  handleFileChange, 
  handleUpdateProduct, 
  handleAddProduct, 
  editingProduct,
  resetForm
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => {
    onOpenChange(open);
    if (!open) resetForm();
  }}>
    <DialogContent 
      className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white border border-gray-200 text-black"
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      <DialogHeader className="border-b border-gray-200 pb-4">
        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
          {isEdit ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          {isEdit ? 'Update product details below.' : 'Fill in the details below to create a new product.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={(e) => {
        e.preventDefault();
        isEdit ? handleUpdateProduct() : handleAddProduct();
      }}>
        <div className="grid gap-6 py-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_sku" className="text-black">Product SKU *</Label>
                <Input
                  id="product_sku"
                  name="product_sku"
                  value={newProduct.product_sku}
                  onChange={handleInputChange}
                  placeholder="e.g. SKU123"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="product_code" className="text-black">Product Code *</Label>
                <Input
                  id="product_code"
                  name="product_code"
                  value={newProduct.product_code}
                  onChange={handleInputChange}
                  placeholder="e.g. PCODE123"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="product_name" className="text-black">Product Name *</Label>
                <Input
                  id="product_name"
                  name="product_name"
                  value={newProduct.product_name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="category_code" className="text-black">Category *</Label>
                {categoriesLoading ? (
                  <p className="text-gray-500">Loading categories...</p>
                ) : categoriesError ? (
                  <p className="text-red-500">{categoriesError}</p>
                ) : (
                  <select
                    id="category_code"
                    name="category_code"
                    value={newProduct.category_code}
                    onChange={handleInputChange}
                    disabled={uploading}
                    className="w-full rounded border bg-white border-gray-300 text-black px-3 py-2 focus:border-black"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.category_code}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-black">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="stock" className="text-black">Stock *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                name="is_featured"
                checked={newProduct.is_featured}
                onCheckedChange={(checked) =>
                  setNewProduct((prev) => ({ ...prev, is_featured: checked }))
                }
                disabled={uploading}
                className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
              />
              <Label htmlFor="is_featured" className="text-black flex items-center gap-2">
                <Star className="w-4 h-4" />
                Featured Product
              </Label>
            </div>
          </div>

          {/* Product Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Product Features</h3>
            {newProduct.features.length === 0 && (
              <p className="text-gray-500">No features added yet.</p>
            )}
            <div className="space-y-3">
              {newProduct.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="Feature Name"
                    value={feature.feature_name}
                    onChange={(e) => updateFeature(idx, 'feature_name', e.target.value)}
                    disabled={uploading}
                    className="flex-1 bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                  />
                  <Input
                    type="text"
                    placeholder="Feature Value"
                    value={feature.feature_value}
                    onChange={(e) => updateFeature(idx, 'feature_value', e.target.value)}
                    disabled={uploading}
                    className="flex-1 bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(idx)}
                    disabled={uploading}
                    className="border-gray-300 text-black hover:bg-red-100 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addFeature}
              disabled={uploading}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Descriptions</h3>
            <div>
              <Label htmlFor="short_description" className="text-black">Short Description</Label>
              <Input
                id="short_description"
                name="short_description"
                value={newProduct.short_description}
                onChange={handleInputChange}
                placeholder="Brief product description"
                disabled={uploading}
                className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
              />
            </div>
            <div>
              <Label htmlFor="long_description" className="text-black">Long Description</Label>
              <textarea
                id="long_description"
                name="long_description"
                value={newProduct.long_description}
                onChange={handleInputChange}
                placeholder="Detailed product description"
                disabled={uploading}
                rows={4}
                className="w-full rounded border bg-white border-gray-300 text-black placeholder-gray-400 px-3 py-2 resize-y focus:border-black"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Product Images</h3>
            <div>
              <input
                type="file"
                id="product_images"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="mt-1 block w-full rounded border-2 border-dashed border-gray-300 bg-white p-6 cursor-pointer text-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
              )}
              {isEdit && editingProduct?.productImages?.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Current: {editingProduct.productImages.length} image{editingProduct.productImages.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 pt-4 space-x-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={uploading}
            className="border-gray-300 text-black hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={uploading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {uploading ? 'Processing...' : (isEdit ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [sortOption, setSortOption] = useState('date_new');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);
  const alertTimeoutRef = useRef(null);
  const token = Cookies.get('token');
  const AUTH_TOKEN = token ? `Bearer ${token}` : null;
  
  const showAlert = (type, message) => {
    setAlert({ type, message });
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => setAlert(null), 4000);
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`https://api.arcdatumcode.info/api/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.data || []);
      setCategoriesError('');
    } catch (err) {
      setCategoriesError(err.message || 'Something went wrong');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.arcdatumcode.info/api/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Feature management functions
  const addFeature = () => {
    setNewProduct((prev) => ({
      ...prev,
      features: [...prev.features, { feature_name: '', feature_value: '' }],
    }));
  };

  const removeFeature = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index, field, value) => {
    setNewProduct((prev) => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = {
        ...updatedFeatures[index],
        [field]: value,
      };
      return {
        ...prev,
        features: updatedFeatures,
      };
    });
  };

  // Edit product functions
  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
      features: product.features || [],
    });
    setSelectedFiles([]);
    setIsEditOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (
      !newProduct.product_sku ||
      !newProduct.product_code ||
      !newProduct.product_name ||
      !newProduct.category_code ||
      !newProduct.price ||
      !newProduct.stock
    ) {
      showAlert('error', 'Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      let uploadedUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadSingleFile(file);
        uploadedUrls.push(url);
      }

      const productPayload = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        productImages: uploadedUrls.length > 0 ? uploadedUrls : editingProduct.productImages,
        features: newProduct.features.filter(
          (f) => f.feature_name.trim() !== '' || f.feature_value.trim() !== ''
        ),
      };

      const res = await fetch(`https://api.arcdatumcode.info/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `${AUTH_TOKEN}`
        },
        body: JSON.stringify(productPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');

      showAlert('success', 'Product updated successfully');
      setIsEditOpen(false);
      setEditingProduct(null);
      setNewProduct({ ...EMPTY_PRODUCT });
      setSelectedFiles([]);
      fetchProducts();
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  // Filtering and sorting
  const filteredProducts = products
    .filter((p) => (filterCategory ? p.category_code === filterCategory : true))
    .filter((p) =>
      filterFeatured === 'all'
        ? true
        : filterFeatured === 'yes'
        ? p.is_featured === true
        : p.is_featured === false
    )
    .filter((p) =>
      searchTerm ? 
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'date_old':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date_new':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleteLoadingId(id);
    try {
      const res = await fetch(`https://api.arcdatumcode.info/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `${AUTH_TOKEN}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
      }
      showAlert('success', 'Product deleted successfully');
      fetchProducts();
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const uploadSingleFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_STORAGE_URL}/uploads`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to upload image');
    }
    const data = await res.json();
    return data.url || data.data?.url || data.fileUrl || data.file_url || data.file;
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.product_sku ||
      !newProduct.product_code ||
      !newProduct.product_name ||
      !newProduct.category_code ||
      !newProduct.price ||
      !newProduct.stock
    ) {
      showAlert('error', 'Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      let uploadedUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadSingleFile(file);
        uploadedUrls.push(url);
      }

      const productPayload = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        productImages: uploadedUrls,
        features: newProduct.features.filter(
          (f) => f.feature_name.trim() !== '' || f.feature_value.trim() !== ''
        ),
      };

      const res = await fetch(`https://api.arcdatumcode.info/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `${AUTH_TOKEN}`
        },
        body: JSON.stringify(productPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add product');

      showAlert('success', 'Product added successfully');
      setIsAddOpen(false);
      setNewProduct({ ...EMPTY_PRODUCT });
      setSelectedFiles([]);
      fetchProducts();
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value, type, checked } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setNewProduct({ ...EMPTY_PRODUCT });
    setSelectedFiles([]);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Package className="w-10 h-10" />
                Product Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your product inventory with style</p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-3">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Product
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert 
            variant={alert.type === 'error' ? 'destructive' : 'default'} 
            className={`mb-6 ${
              alert.type === 'error' 
                ? 'bg-red-100 border-red-300 text-red-700' 
                : 'bg-green-100 border-green-300 text-green-700'
            }`}
          >
            <AlertTitle className="font-semibold">
              {alert.type === 'error' ? 'Error' : 'Success'}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="bg-white border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label className="text-black mb-2 block">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search by name, SKU, or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div>
                <Label className="text-black mb-2 block flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </Label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded border bg-white border-gray-300 text-black px-3 py-2 focus:border-black"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.category_code}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured filter */}
              <div>
                <Label className="text-black mb-2 block flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Featured
                </Label>
                <select
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value)}
                  className="w-full rounded border bg-white border-gray-300 text-black px-3 py-2 focus:border-black"
                >
                  <option value="all">All</option>
                  <option value="yes">Featured</option>
                  <option value="no">Not Featured</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <Label className="text-black mb-2 block flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  Sort By
                </Label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full rounded border bg-white border-gray-300 text-black px-3 py-2 focus:border-black"
                >
                  <option value="date_new">Date: New to Old</option>
                  <option value="date_old">Date: Old to New</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 hover:bg-gray-50">
                      <TableHead className="text-black font-semibold">SKU</TableHead>
                      <TableHead className="text-black font-semibold">Name</TableHead>
                      <TableHead className="text-black font-semibold">Category</TableHead>
                      <TableHead className="text-black font-semibold">Price</TableHead>
                      <TableHead className="text-black font-semibold">Stock</TableHead>
                      <TableHead className="text-black font-semibold">Featured</TableHead>
                      <TableHead className="text-black font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell className="font-medium text-black">{product.product_sku}</TableCell>
                        <TableCell className="text-black">{product.product_name}</TableCell>
                        <TableCell className="text-gray-600">
                          {categories.find(c => c.category_code === product.category_code)?.category_name || product.category_code}
                        </TableCell>
                        <TableCell className="text-black">${product.price.toFixed(2)}</TableCell>
                        <TableCell className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                          {product.stock}
                        </TableCell>
                        <TableCell>
                          {product.is_featured ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="text-gray-600 hover:text-black hover:bg-gray-100"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            disabled={deleteLoadingId === product._id}
                            className="text-gray-600 hover:text-red-600 hover:bg-gray-100"
                          >
                            {deleteLoadingId === product._id ? (
                              <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-black rounded-full"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {!loading && !error && filteredProducts.length > 0 && (
            <CardFooter className="border-t border-gray-200 py-4 px-6">
              <p className="text-gray-500 text-sm">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Add Product Dialog */}
      <ProductDialog 
        isOpen={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        isEdit={false}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        uploading={uploading}
        handleInputChange={handleInputChange}
        updateFeature={updateFeature}
        removeFeature={removeFeature}
        addFeature={addFeature}
        handleFileChange={handleFileChange}
        handleUpdateProduct={handleUpdateProduct}
        handleAddProduct={handleAddProduct}
        editingProduct={editingProduct}
        resetForm={resetForm}
      />

      {/* Edit Product Dialog */}
      <ProductDialog 
        isOpen={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        isEdit={true}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        uploading={uploading}
        handleInputChange={handleInputChange}
        updateFeature={updateFeature}
        removeFeature={removeFeature}
        addFeature={addFeature}
        handleFileChange={handleFileChange}
        handleUpdateProduct={handleUpdateProduct}
        handleAddProduct={handleAddProduct}
        editingProduct={editingProduct}
        resetForm={resetForm}
      />
    </div>
  );
}