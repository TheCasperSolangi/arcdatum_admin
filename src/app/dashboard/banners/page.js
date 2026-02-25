"use client"
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import Cookies from 'js-cookie';
const BannerDashboard = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const token = Cookies.get('token'); // replace 'auth_token' with your cookie name
  const AUTH_TOKEN = token ? `Bearer ${token}` : null;

  const baseUrl = https://api.arcdatumcode.info/api;

  // API Functions
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/banners`, {
        headers: {
          'Authorization': `${AUTH_TOKEN}`
        }
      });
      const data = await response.json();
      setBanners(data.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBannerAPI = async (bannerData) => {
    try {
      const response = await fetch(`${baseUrl}/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${AUTH_TOKEN}`
        },
        body: JSON.stringify(bannerData),
      });
      const data = await response.json();
      if (response.ok) {
        fetchBanners(); // Refresh the list
        return data;
      } else {
        throw new Error(data.message || 'Failed to create banner');
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  };

  const updateBannerAPI = async (id, bannerData) => {
    try {
      const response = await fetch(`${baseUrl}/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${AUTH_TOKEN}`
        },
        body: JSON.stringify(bannerData),
      });
      const data = await response.json();
      if (response.ok) {
        fetchBanners(); // Refresh the list
        return data;
      } else {
        throw new Error(data.message || 'Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  };

  const deleteBannerAPI = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${AUTH_TOKEN}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        fetchBanners(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  };

  const uploadImage = async (file) => {
    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_STORAGE_SERVER}/api/uploads`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (response.ok) {
        return data.url; // Return the image URL
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredBanners = banners.filter(banner => {
    return banner.banner_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           banner.banner_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const CreateBannerForm = ({ onClose, banner = null }) => {
    const [formData, setFormData] = useState({
      banner_title: banner?.banner_title || '',
      banner_name: banner?.banner_name || '',
      banner_image: banner?.banner_image || ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(banner?.banner_image || '');

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        setPreviewImage(URL.createObjectURL(file));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        let bannerImageUrl = formData.banner_image;
        
        // Upload new image if selected
        if (imageFile) {
          bannerImageUrl = await uploadImage(imageFile);
        }

        const bannerData = {
          ...formData,
          banner_image: bannerImageUrl
        };

        if (banner) {
          await updateBannerAPI(banner._id, bannerData);
        } else {
          await createBannerAPI(bannerData);
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
            {banner ? 'Edit Banner' : 'Create New Banner'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Banner Title</label>
              <input
                type="text"
                value={formData.banner_title}
                onChange={(e) => setFormData({...formData, banner_title: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Banner Name</label>
              <input
                type="text"
                value={formData.banner_name}
                onChange={(e) => setFormData({...formData, banner_name: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
              />
              {previewImage && (
                <div className="mt-2">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-w-full h-32 object-contain border rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                disabled={imageUploading}
              >
                {imageUploading ? 'Uploading...' : (banner ? 'Update' : 'Create')}
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

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBannerAPI(id);
      } catch (error) {
        alert(`Error deleting banner: ${error.message}`);
      }
    }
  };

  const stats = {
    totalBanners: banners.length,
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">Banner Management</h1>
        <p className="text-gray-600">Manage your website banners</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Banners</p>
              <p className="text-2xl font-bold text-black">{stats.totalBanners}</p>
            </div>
            <ImageIcon className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black"
          />
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-black text-lg">Loading banners...</div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBanners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-black">{banner.banner_title}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-black">{banner.banner_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {banner.banner_image && (
                        <div className="flex items-center">
                          <img 
                            src={banner.banner_image} 
                            alt={banner.banner_title}
                            className="w-16 h-10 object-cover rounded"
                          />
                          <button 
                            onClick={() => window.open(banner.banner_image, '_blank')}
                            className="ml-2 text-gray-500 hover:text-black"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditItem(banner);
                            setShowCreateModal(true);
                          }}
                          className="text-black hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(banner._id)}
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
            {filteredBanners.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No banners match your search' : 'No banners found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateBannerForm
          onClose={() => {
            setShowCreateModal(false);
            setEditItem(null);
          }}
          banner={editItem}
        />
      )}
    </div>
  );
};

export default BannerDashboard;