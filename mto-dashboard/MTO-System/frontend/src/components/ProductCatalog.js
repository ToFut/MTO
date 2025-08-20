import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaPalette, FaStar, FaHeart, FaShoppingBag } from 'react-icons/fa';

const ProductCatalog = ({ onCustomize = null }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Real product data based on customizable items
  const products = [
    {
      id: 1,
      name: 'Custom Initial Bracelet',
      category: 'bracelets',
      brand: 'BaubleBar',
      price: 48,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400',
      colors: ['Gold', 'Silver', 'Rose Gold'],
      rating: 4.8,
      reviews: 2341,
      description: 'Personalize with your initials',
      type: 'bracelet'
    },
    {
      id: 2,
      name: 'Beaded Charm Bracelet',
      category: 'bracelets',
      brand: 'BaubleBar',
      price: 68,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
      colors: ['Multi', 'Pastel', 'Ocean'],
      rating: 4.9,
      reviews: 1876,
      description: 'Mix and match bead colors',
      type: 'bracelet'
    },
    {
      id: 9,
      name: 'Icon Tote Bag',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 65,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
      colors: ['Natural', 'Black', 'Navy', 'Burgundy'],
      rating: 4.9,
      reviews: 3421,
      description: 'Customize with 6 icon spots',
      type: 'tote'
    },
    {
      id: 10,
      name: 'Personalized Canvas Tote',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 55,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400',
      colors: ['Natural', 'Black'],
      rating: 4.8,
      reviews: 2156,
      description: 'Add text and icons',
      type: 'tote'
    },
    {
      id: 3,
      name: 'Layered Initial Necklace',
      category: 'necklaces',
      brand: 'BaubleBar',
      price: 78,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
      colors: ['Gold', 'Silver', 'Two-Tone'],
      rating: 4.7,
      reviews: 3201,
      description: 'Add up to 5 initials'
    },
    {
      id: 4,
      name: 'Custom Name Necklace',
      category: 'necklaces',
      brand: 'BaubleBar',
      price: 98,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      colors: ['Gold', 'Silver', 'Rose Gold'],
      rating: 4.9,
      reviews: 4532,
      description: 'Your name in elegant script'
    },
    {
      id: 5,
      name: 'Monogram Pendant',
      category: 'necklaces',
      brand: 'BaubleBar',
      price: 88,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400',
      colors: ['Gold', 'Silver', 'Black'],
      rating: 4.6,
      reviews: 987,
      description: 'Classic monogram style'
    },
    {
      id: 6,
      name: 'Custom Hoop Earrings',
      category: 'earrings',
      brand: 'BaubleBar',
      price: 58,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400',
      colors: ['Gold', 'Silver', 'Two-Tone'],
      rating: 4.8,
      reviews: 2109,
      description: 'Add charms or initials'
    },
    {
      id: 7,
      name: 'Birthstone Studs',
      category: 'earrings',
      brand: 'BaubleBar',
      price: 38,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
      colors: ['Various Stones'],
      rating: 4.7,
      reviews: 1654,
      description: 'Choose your birthstone'
    },
    {
      id: 8,
      name: 'Personalized Phone Case',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 45,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
      colors: ['Multiple Patterns'],
      rating: 4.5,
      reviews: 876,
      description: 'Add initials or name'
    },
    {
      id: 9,
      name: 'Custom Tote Bag',
      category: 'bags',
      brand: 'MTO Collection',
      price: 65,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
      colors: ['Canvas', 'Leather', 'Denim'],
      rating: 4.9,
      reviews: 2987,
      description: 'Personalize with monogram'
    },
    {
      id: 10,
      name: 'Initial Ring Set',
      category: 'rings',
      brand: 'BaubleBar',
      price: 42,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
      colors: ['Gold', 'Silver', 'Mixed'],
      rating: 4.6,
      reviews: 1432,
      description: 'Stack your initials'
    },
    {
      id: 11,
      name: 'Premium Monogram Tote',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 75,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      colors: ['Black', 'Navy', 'Gray', 'Cream'],
      rating: 4.9,
      reviews: 1893,
      description: 'Large initials with monogram circle',
      type: 'initialsTote'
    },
    {
      id: 12,
      name: 'Luxury Throw Blanket',
      category: 'home',
      brand: 'BaubleBar',
      price: 120,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      colors: ['Cream', 'Gray', 'Navy', 'Burgundy'],
      rating: 4.8,
      reviews: 756,
      description: 'Personalized with monogram or text',
      type: 'blanket'
    },
    {
      id: 13,
      name: 'Custom Cozy Blanket',
      category: 'home',
      brand: 'BaubleBar',
      price: 95,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
      colors: ['Cream', 'Gray', 'Burgundy'],
      rating: 4.7,
      reviews: 432,
      description: 'Add patterns and fringe',
      type: 'blanket'
    },
    {
      id: 14,
      name: 'Stackable Ring Set',
      category: 'rings',
      brand: 'BaubleBar',
      price: 65,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
      colors: ['Gold', 'Silver', 'Mixed'],
      rating: 4.8,
      reviews: 2341,
      description: 'Mix metals and add birthstones'
    },
    {
      id: 15,
      name: 'Initial Signet Ring',
      category: 'rings',
      brand: 'BaubleBar',
      price: 78,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
      colors: ['Gold', 'Silver', 'Rose Gold'],
      rating: 4.9,
      reviews: 1654,
      description: 'Classic signet with your initial'
    },
    {
      id: 16,
      name: 'Custom Anklet',
      category: 'bracelets',
      brand: 'BaubleBar',
      price: 42,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      colors: ['Gold', 'Silver'],
      rating: 4.6,
      reviews: 987,
      description: 'Add charms and beads'
    },
    {
      id: 17,
      name: 'Personalized Hair Clips',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 28,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
      colors: ['Gold', 'Silver', 'Rose Gold'],
      rating: 4.7,
      reviews: 1234,
      description: 'Add initials or small icons'
    },
    {
      id: 18,
      name: 'Custom Leather Keychain',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 35,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      colors: ['Black', 'Brown', 'Tan'],
      rating: 4.8,
      reviews: 876,
      description: 'Emboss with initials or short text'
    },
    {
      id: 19,
      name: 'Charm Choker Necklace',
      category: 'necklaces',
      brand: 'BaubleBar',
      price: 68,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400',
      colors: ['Gold', 'Silver', 'Black'],
      rating: 4.7,
      reviews: 1543,
      description: 'Add up to 5 charms'
    },
    {
      id: 20,
      name: 'Personalized Water Bottle',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 52,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      colors: ['White', 'Black', 'Pink', 'Blue'],
      rating: 4.6,
      reviews: 654,
      description: 'Add name and fun icons'
    },
    {
      id: 21,
      name: 'Custom Picture Frame',
      category: 'home',
      brand: 'BaubleBar',
      price: 48,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
      colors: ['Gold', 'Silver', 'White', 'Black'],
      rating: 4.8,
      reviews: 432,
      description: 'Engrave with names and dates'
    },
    {
      id: 22,
      name: 'Monogram Makeup Bag',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 38,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1631214540827-c99da3c6e2e0?w=400&h=400&fit=crop',
      colors: ['Pink', 'Black', 'Cream', 'Navy'],
      rating: 4.7,
      reviews: 876,
      description: 'Add initials in elegant font'
    },
    {
      id: 23,
      name: 'Custom Pet Collar',
      category: 'pets',
      brand: 'BaubleBar',
      price: 32,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
      colors: ['Red', 'Blue', 'Pink', 'Black'],
      rating: 4.9,
      reviews: 1234,
      description: 'Add your pet\'s name and phone number'
    },
    {
      id: 24,
      name: 'Personalized Mouse Pad',
      category: 'accessories',
      brand: 'BaubleBar',
      price: 25,
      customizable: true,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      colors: ['White', 'Black', 'Gray'],
      rating: 4.5,
      reviews: 543,
      description: 'Add motivational text or design'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'bracelets', name: 'Bracelets', count: products.filter(p => p.category === 'bracelets').length },
    { id: 'necklaces', name: 'Necklaces', count: products.filter(p => p.category === 'necklaces').length },
    { id: 'earrings', name: 'Earrings', count: products.filter(p => p.category === 'earrings').length },
    { id: 'rings', name: 'Rings', count: products.filter(p => p.category === 'rings').length },
    { id: 'accessories', name: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
    { id: 'bags', name: 'Bags', count: products.filter(p => p.category === 'bags').length },
    { id: 'home', name: 'Home & Living', count: products.filter(p => p.category === 'home').length },
    { id: 'pets', name: 'Pet Accessories', count: products.filter(p => p.category === 'pets').length }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    
    return matchesCategory && matchesSearch && matchesPrice && matchesBrand;
  });

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCustomize = (product) => {
    if (onCustomize) {
      // Use custom handler if provided
      onCustomize(product);
    } else {
      // Default behavior: navigate to separate customization page
      navigate('/customize', { state: { product } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customize Your Style</h1>
              <p className="text-gray-600 mt-1">Personalize jewelry and accessories just for you</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaFilter />
              </motion.button>
              <div className="relative">
                <FaHeart className="text-red-500" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <motion.button
                    key={category.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all flex justify-between items-center ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">{category.count}</span>
                  </motion.button>
                ))}
              </div>

              {/* Price Range */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Price Range</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Brands */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Brands</h3>
                <div className="space-y-2">
                  {['BaubleBar', 'MTO Collection'].map(brand => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }
                        }}
                        className="text-purple-600"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{filteredProducts.length} products found</p>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500">
                <option>Most Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Best Rated</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ y: -4 }}
                  onHoverStart={() => setHoveredProduct(product.id)}
                  onHoverEnd={() => setHoveredProduct(null)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden group"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite(product.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      >
                        <FaHeart className={`${favorites.includes(product.id) ? 'text-red-500' : 'text-gray-400'}`} />
                      </motion.button>
                    </div>
                    {product.customizable && (
                      <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Customizable
                      </div>
                    )}
                    <AnimatePresence>
                      {hoveredProduct === product.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="absolute inset-x-0 bottom-0 p-4"
                        >
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCustomize(product)}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <FaPalette />
                            Customize
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-xl font-bold text-purple-600">${product.price}</p>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span>{product.rating}</span>
                        <span className="text-gray-500">({product.reviews})</span>
                      </div>
                      <div className="flex gap-1">
                        {product.colors.slice(0, 3).map((color, idx) => (
                          <span key={idx} className="text-xs text-gray-500">{color}{idx < 2 && ','}</span>
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add to Cart */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-2xl cursor-pointer hover:bg-purple-700 transition-colors"
      >
        <FaShoppingBag size={24} />
      </motion.div>
    </div>
  );
};

export default ProductCatalog;