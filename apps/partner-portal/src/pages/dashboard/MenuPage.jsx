import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Modal } from '@grub-gate/ui';
import { mockMenuItems } from '../../lib/mock-data.js';

const MenuPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ordersDesc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('basics');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'appetizer', label: t('menu.categories.appetizer') },
    { value: 'main', label: t('menu.categories.main') },
    { value: 'dessert', label: t('menu.categories.dessert') },
    { value: 'beverage', label: t('menu.categories.beverage') },
    { value: 'salad', label: t('menu.categories.salad') },
    { value: 'soup', label: t('menu.categories.soup') }
  ];

  let filteredItems = mockMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting
  filteredItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'priceAsc': return a.price - b.price;
      case 'priceDesc': return b.price - a.price;
      case 'ratingDesc': return (b.rating || 0) - (a.rating || 0);
      case 'ordersDesc': return (b.totalOrders || 0) - (a.totalOrders || 0);
      default: return 0;
    }
  });

  const toggleItemStatus = (itemId) => {
    // In a real app, this would update the item status via API
    console.log('Toggle status for item:', itemId);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      // In a real app, this would delete the item via API
      console.log('Delete item:', itemId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-grub-red to-red-600 text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t('menu.title')}</h1>
            <p className="text-red-100 text-sm">{t('menu.subtitle')}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="px-4 bg-grub-red hover:bg-red-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <Plus className="h-4 w-4 mr-2" />{t('menu.addItem')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            {/* Category */}
            <div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red">
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            {/* Status */}
            <div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red">
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            {/* Sort */}
            <div className="md:col-span-1">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red">
                <option value="ordersDesc">Sort: Most Ordered</option>
                <option value="ratingDesc">Sort: Top Rated</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image area */}
            <div className="h-36 sm:h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative">
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.status === 'available' ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
            
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                <span className="text-base sm:text-lg font-extrabold text-grub-red">${item.price}</span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 mb-3">
                <span className="inline-flex items-center"><Clock className="h-4 w-4 mr-1" />{item.prepTime}min</span>
                <span className="inline-flex items-center"><Users className="h-4 w-4 mr-1" />{item.servings}</span>
                <span className="inline-flex items-center"><Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />{item.rating}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(item.dietaryPreferences || item.dietary || []).map((diet) => (
                  <span key={diet} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                    {t(`menu.dietary.${diet}`, diet.replace('-', ' '))}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.totalOrders} orders</span>
                <div className="flex space-x-1 sm:space-x-2">
                  <button onClick={() => handleEditItem(item)} className="px-2 py-1.5 rounded-md border text-gray-600 hover:text-blue-600 hover:border-blue-200">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className="px-2 py-1.5 rounded-md border text-gray-600 hover:text-red-600 hover:border-red-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile floating add button */}
      <Button
        variant="primary"
        aria-label="Add menu item"
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-24 right-5 z-20 rounded-full bg-grub-red hover:bg-red-700 text-white shadow-xl px-4 py-3 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 transition-transform"
      >
        <Plus className="h-5 w-5" />
      </Button>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        title={editingItem ? t('menu.editItem') : t('menu.addItem')}
        size="lg"
      >
        <div className="space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto pb-4">
          {/* Segmented tabs */}
          <div className="flex items-center justify-between">
            <div className="inline-flex bg-gray-100 rounded-lg p-1 text-sm">
              {[
                { id: 'basics', label: 'Basics' },
                { id: 'availability', label: 'Availability' },
                { id: 'details', label: 'Details' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === tab.id ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* BASICS TAB */}
          {activeTab === 'basics' && (
            <div className="space-y-4">
              {/* Item name */}
              <Input label={t('menu.form.name')} placeholder="Item name" defaultValue={editingItem?.name || ''} />

              {/* Price + Category (two-up even on mobile) */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input type="number" step="0.01" defaultValue={editingItem?.price || ''} placeholder="0.00" className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red">
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prep time + Servings */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Input label={t('menu.form.prepTime')} type="number" placeholder="30" defaultValue={editingItem?.prepTime || ''} />
                <Input label={t('menu.form.servings')} type="number" placeholder="1" defaultValue={editingItem?.servings || ''} />
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red" defaultValue={editingItem?.status || 'available'}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div className="hidden sm:block"></div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('menu.form.description')}</label>
                <textarea rows={4} defaultValue={editingItem?.description || ''} placeholder="Item description" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red" />
              </div>

              {/* Image URL + preview (preview hidden on mobile) */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" defaultValue={editingItem?.image || ''} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red" />
                <div className="mt-3 hidden md:flex aspect-video bg-gray-100 rounded-lg overflow-hidden border items-center justify-center">
                  {editingItem?.image ? (
                    <img src={editingItem.image} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm">Preview</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === 'availability' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Choose when this item is available for customers to add to their weekly plan.</p>
              <div className="overflow-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2">Day</th>
                      <th className="text-center px-3 py-2">Lunch</th>
                      <th className="text-center px-3 py-2">Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                      <tr key={d} className="border-t">
                        <td className="px-3 py-2 capitalize">{d}</td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" defaultChecked={editingItem?.availability?.[d]?.lunch ?? true} className="h-4 w-4 text-grub-red" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" defaultChecked={editingItem?.availability?.[d]?.dinner ?? true} className="h-4 w-4 text-grub-red" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['vegetarian','vegan','gluten-free','dairy-free','keto','halal','kosher','spicy'].map(opt => (
                    <label key={opt} className="inline-flex items-center space-x-2 text-sm">
                      <input type="checkbox" defaultChecked={(editingItem?.dietaryPreferences || editingItem?.dietary || []).includes(opt)} className="h-4 w-4 text-grub-red" />
                      <span className="capitalize">{opt.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Allergens (comma separated)" placeholder="e.g., dairy, gluten" defaultValue={(editingItem?.allergens || []).join(', ')} />
                <Input label="Ingredients (comma separated)" placeholder="e.g., chicken, mushrooms" defaultValue={(editingItem?.ingredients || []).join(', ')} />
              </div>
            </div>
          )}

        </div>
        
        {/* Footer actions - Outside scrollable area */}
        <div className="border-t bg-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3 mt-4">
            <Button
              variant="secondary"
              className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
              onClick={() => { setShowAddModal(false); setEditingItem(null); }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto bg-grub-red hover:bg-red-700 text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              {editingItem ? t('common.save') : t('menu.addItem')}
            </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MenuPage;





