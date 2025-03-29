// server/controllers/auth.js
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phoneNumber } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'customer' : role, // Prevent creating admin accounts directly
    phoneNumber
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Add user address
// @route   POST /api/v1/auth/address
// @access  Private
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  // If this is set as default, remove default from other addresses
  if (req.body.isDefault) {
    user.addresses.forEach(address => {
      address.isDefault = false;
    });
  }
  
  // If this is the first address, set as default
  if (user.addresses.length === 0) {
    req.body.isDefault = true;
  }
  
  user.addresses.push(req.body);
  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses
  });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

// server/controllers/menuItems.js
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all menu items
// @route   GET /api/v1/menu
// @access  Public
exports.getMenuItems = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single menu item
// @route   GET /api/v1/menu/:id
// @access  Public
exports.getMenuItem = asyncHandler(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('category');

  if (!menuItem) {
    return next(
      new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: menuItem
  });
});

// @desc    Create new menu item
// @route   POST /api/v1/menu
// @access  Private/Admin
exports.createMenuItem = asyncHandler(async (req, res, next) => {
  // Check if category exists
  const category = await Category.findById(req.body.category);
  
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.body.category}`, 404)
    );
  }

  const menuItem = await MenuItem.create(req.body);

  res.status(201).json({
    success: true,
    data: menuItem
  });
});

// @desc    Update menu item
// @route   PUT /api/v1/menu/:id
// @access  Private/Admin
exports.updateMenuItem = asyncHandler(async (req, res, next) => {
  let menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return next(
      new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
    );
  }

  // If updating category, check if it exists
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    
    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id of ${req.body.category}`, 404)
      );
    }
  }

  menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: menuItem
  });
});

// @desc    Delete menu item
// @route   DELETE /api/v1/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = asyncHandler(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return next(
      new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
    );
  }

  await menuItem.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update menu item availability
// @route   PUT /api/v1/menu/:id/availability
// @access  Private/Admin/Staff
exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const { isAvailable } = req.body;

  if (isAvailable === undefined) {
    return next(new ErrorResponse('Please provide availability status', 400));
  }

  const menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { isAvailable },
    {
      new: true,
      runValidators: true
    }
  );

  if (!menuItem) {
    return next(
      new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: menuItem
  });
});

// server/controllers/orders.js
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get current user orders
// @route   GET /api/v1/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .sort('-createdAt')
    .populate({
      path: 'items.menuItem',
      select: 'name image'
    });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name email phoneNumber'
    })
    .populate({
      path: 'items.menuItem',
      select: 'name image price description'
    });

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is order owner or an admin/staff
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'staff') {
    return next(new ErrorResponse(`Not authorized to access this order`, 401));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  
  // Validate and calculate items
  let subtotal = 0;
  const items = [];
  
  // Check if items exist and are available
  if (!req.body.items || req.body.items.length === 0) {
    return next(new ErrorResponse('Please add items to your order', 400));
  }
  
  for (const item of req.body.items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    
    if (!menuItem) {
      return next(new ErrorResponse(`Menu item not found with id of ${item.menuItem}`, 404));
    }
    
    if (!menuItem.isAvailable) {
      return next(new ErrorResponse(`${menuItem.name} is currently unavailable`, 400));
    }
    
    // Calculate item price with customizations
    let itemPrice = menuItem.discountPrice || menuItem.price;
    let customizationTotal = 0;
    
    if (item.customizations && item.customizations.length > 0) {
      for (const customization of item.customizations) {
        if (customization.extraPrice) {
          customizationTotal += customization.extraPrice;
        }
      }
    }
    
    const totalItemPrice = (itemPrice + customizationTotal) * item.quantity;
    subtotal += totalItemPrice;
    
    items.push({
      menuItem: item.menuItem,
      name: menuItem.name,
      price: itemPrice,
      quantity: item.quantity,
      customizations: item.customizations || []
    });
  }
  
  // Calculate tax, delivery fee, and total
  const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% tax
  let deliveryFee = 0;
  
  if (req.body.deliveryType === 'delivery') {
    deliveryFee = 3.99; // Standard delivery fee
  }
  
  const total = subtotal + tax + deliveryFee - (req.body.discount || 0);
  
  // Create the order
  const orderData = {
    user: req.user.id,
    items,
    subtotal,
    tax,
    deliveryFee,
    discount: req.body.discount || 0,
    total,
    paymentMethod: req.body.paymentMethod,
    deliveryType: req.body.deliveryType,
    specialInstructions: req.body.specialInstructions
  };
  
  if (req.body.deliveryType === 'delivery') {
    if (!req.body.deliveryAddress) {
      return next(new ErrorResponse('Please provide a delivery address', 400));
    }
    orderData.deliveryAddress = req.body.deliveryAddress;
    orderData.deliveryInstructions = req.body.deliveryInstructions;
  }
  
  // Set estimated delivery time
  const currentTime = new Date();
  const estimatedTime = new Date(currentTime);
  estimatedTime.setMinutes(currentTime.getMinutes() + (req.body.deliveryType === 'delivery' ? 45 : 20));
  orderData.estimatedDeliveryTime = estimatedTime;
  
  const order = await Order.create(orderData);
  
  // Return the newly created order
  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin/Staff
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status) {
    return next(new ErrorResponse('Please provide a status', 400));
  }
  
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }
  
 // Continuing server/controllers/orders.js
 let order = await Order.findById(req.params.id);
  
 if (!order) {
   return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
 }
 
 // Add user to status history
 order.status = status;
 order.statusHistory.push({
   status,
   updatedBy: req.user.id
 });
 
 // If status is delivered or completed, set actual delivery time
 if (status === 'delivered' || status === 'completed') {
   order.actualDeliveryTime = Date.now();
 }
 
 await order.save();
 
 // For websocket notification in real-time
 const io = req.app.get('io');
 if (io) {
   io.to(`order-${order._id}`).emit('statusUpdate', {
     orderId: order._id,
     status: order.status
   });
   
   // Also notify the specific user
   io.to(`user-${order.user}`).emit('orderUpdate', {
     orderId: order._id,
     status: order.status
   });
 }
 
 res.status(200).json({
   success: true,
   data: order
 });
});

// server/controllers/reviews.js
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
 if (req.params.menuItemId) {
   const reviews = await Review.find({ menuItem: req.params.menuItemId })
     .populate({
       path: 'user',
       select: 'name'
     });
   
   return res.status(200).json({
     success: true,
     count: reviews.length,
     data: reviews
   });
 } else {
   res.status(200).json(res.advancedResults);
 }
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
 const review = await Review.findById(req.params.id).populate({
   path: 'user',
   select: 'name'
 }).populate({
   path: 'menuItem',
   select: 'name'
 });

 if (!review) {
   return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
 }

 res.status(200).json({
   success: true,
   data: review
 });
});

// @desc    Add review
// @route   POST /api/v1/menu/:menuItemId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
 req.body.menuItem = req.params.menuItemId;
 req.body.user = req.user.id;

 const menuItem = await MenuItem.findById(req.params.menuItemId);

 if (!menuItem) {
   return next(new ErrorResponse(`Menu item not found with id of ${req.params.menuItemId}`, 404));
 }

 // Check if user has ordered this item
 if (req.body.order) {
   const order = await Order.findById(req.body.order);
   
   if (!order) {
     return next(new ErrorResponse(`Order not found with id of ${req.body.order}`, 404));
   }

   if (order.user.toString() !== req.user.id) {
     return next(new ErrorResponse('Not authorized to add review for this order', 401));
   }

   const orderedItem = order.items.find(
     item => item.menuItem.toString() === req.params.menuItemId
   );

   if (!orderedItem) {
     return next(new ErrorResponse('You can only review items you have ordered', 400));
   }
 }

 const review = await Review.create(req.body);

 res.status(201).json({
   success: true,
   data: review
 });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
 let review = await Review.findById(req.params.id);

 if (!review) {
   return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
 }

 // Make sure review belongs to user or user is admin
 if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
   return next(new ErrorResponse('Not authorized to update review', 401));
 }

 review = await Review.findByIdAndUpdate(req.params.id, req.body, {
   new: true,
   runValidators: true
 });

 res.status(200).json({
   success: true,
   data: review
 });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
 const review = await Review.findById(req.params.id);

 if (!review) {
   return next(new ErrorResponse(`Review not found with id of ${req.params.id}`, 404));
 }

 // Make sure review belongs to user or user is admin
 if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
   return next(new ErrorResponse('Not authorized to delete review', 401));
 }

 await review.remove();

 res.status(200).json({
   success: true,
   data: {}
 });
});

// server/controllers/categories.js
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
 res.status(200).json(res.advancedResults);
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
 const category = await Category.findById(req.params.id);

 if (!category) {
   return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
 }

 res.status(200).json({
   success: true,
   data: category
 });
});

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
 const category = await Category.create(req.body);

 res.status(201).json({
   success: true,
   data: category
 });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
 let category = await Category.findById(req.params.id);

 if (!category) {
   return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
 }

 category = await Category.findByIdAndUpdate(req.params.id, req.body, {
   new: true,
   runValidators: true
 });

 res.status(200).json({
   success: true,
   data: category
 });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
 const category = await Category.findById(req.params.id);

 if (!category) {
   return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
 }

 // Check if there are menu items using this category
 const menuItems = await MenuItem.find({ category: req.params.id });
 
 if (menuItems.length > 0) {
   return next(new ErrorResponse(`Cannot delete category that has menu items. Please reassign menu items first.`, 400));
 }

 await category.remove();

 res.status(200).json({
   success: true,
   data: {}
 });
});

// server/controllers/inventory.js
const Inventory = require('../models/Inventory');
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all inventory items
// @route   GET /api/v1/inventory
// @access  Private/Admin/Staff
exports.getInventoryItems = asyncHandler(async (req, res, next) => {
 res.status(200).json(res.advancedResults);
});

// @desc    Get single inventory item
// @route   GET /api/v1/inventory/:id
// @access  Private/Admin/Staff
exports.getInventoryItem = asyncHandler(async (req, res, next) => {
 const inventoryItem = await Inventory.findById(req.params.id).populate('affectedMenuItems');

 if (!inventoryItem) {
   return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
 }

 res.status(200).json({
   success: true,
   data: inventoryItem
 });
});

// @desc    Create new inventory item
// @route   POST /api/v1/inventory
// @access  Private/Admin
exports.createInventoryItem = asyncHandler(async (req, res, next) => {
 const inventoryItem = await Inventory.create(req.body);

 res.status(201).json({
   success: true,
   data: inventoryItem
 });
});

// @desc    Update inventory item
// @route   PUT /api/v1/inventory/:id
// @access  Private/Admin/Staff
exports.updateInventoryItem = asyncHandler(async (req, res, next) => {
 let inventoryItem = await Inventory.findById(req.params.id);

 if (!inventoryItem) {
   return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
 }

 inventoryItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
   new: true,
   runValidators: true
 });

 res.status(200).json({
   success: true,
   data: inventoryItem
 });
});

// @desc    Delete inventory item
// @route   DELETE /api/v1/inventory/:id
// @access  Private/Admin
exports.deleteInventoryItem = asyncHandler(async (req, res, next) => {
 const inventoryItem = await Inventory.findById(req.params.id);

 if (!inventoryItem) {
   return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
 }

 await inventoryItem.remove();

 res.status(200).json({
   success: true,
   data: {}
 });
});

// @desc    Update inventory stock
// @route   PUT /api/v1/inventory/:id/stock
// @access  Private/Admin/Staff
exports.updateStock = asyncHandler(async (req, res, next) => {
 const { action, quantity, notes } = req.body;
 
 if (!action || !quantity) {
   return next(new ErrorResponse('Please provide action and quantity', 400));
 }
 
 const inventoryItem = await Inventory.findById(req.params.id);
 
 if (!inventoryItem) {
   return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
 }
 
 let newStock = inventoryItem.currentStock;
 
 switch (action) {
   case 'added':
     newStock += quantity;
     break;
   case 'removed':
     newStock -= quantity;
     if (newStock < 0) {
       return next(new ErrorResponse('Cannot remove more than current stock', 400));
     }
     break;
   case 'adjusted':
     newStock = quantity;
     break;
   default:
     return next(new ErrorResponse('Invalid action', 400));
 }
 
 // Add to stock history
 inventoryItem.stockHistory.push({
   action,
   quantity,
   user: req.user.id,
   notes
 });
 
 inventoryItem.currentStock = newStock;
 
 // Check if we need to update menu item availability
 if (newStock <= 0 && inventoryItem.affectedMenuItems && inventoryItem.affectedMenuItems.length > 0) {
   for (const menuItemId of inventoryItem.affectedMenuItems) {
     await MenuItem.findByIdAndUpdate(menuItemId, { isAvailable: false });
   }
 }
 
 await inventoryItem.save();
 
 res.status(200).json({
   success: true,
   data: inventoryItem
 });
});

// @desc    Get low stock items
// @route   GET /api/v1/inventory/lowstock
// @access  Private/Admin/Staff
exports.getLowStockItems = asyncHandler(async (req, res, next) => {
 const inventoryItems = await Inventory.find({
   $expr: { $lte: ['$currentStock', '$minStockLevel'] }
 }).sort('currentStock');

 res.status(200).json({
   success: true,
   count: inventoryItems.length,
   data: inventoryItems
 });
});