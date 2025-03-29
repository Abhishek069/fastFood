// server/routes/auth.js
const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  addAddress
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/address', protect, addAddress);

module.exports = router;

// server/routes/menuItems.js
const express = require('express');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability
} = require('../controllers/menuItems');

const MenuItem = require('../models/MenuItem');

// Include other resource routers
const reviewRouter = require('./reviews');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:menuItemId/reviews', reviewRouter);

router
  .route('/')
  .get(advancedResults(MenuItem, 'category'), getMenuItems)
  .post(protect, authorize('admin'), createMenuItem);

router
  .route('/:id')
  .get(getMenuItem)
  .put(protect, authorize('admin'), updateMenuItem)
  .delete(protect, authorize('admin'), deleteMenuItem);

router
  .route('/:id/availability')
  .put(protect, authorize('admin', 'staff'), updateAvailability);

module.exports = router;

// server/routes/orders.js
const express = require('express');
const {
  getOrders,
  getMyOrders,
  getOrder,
  createOrder,
  updateOrderStatus
} = require('../controllers/orders');

const Order = require('../models/Order');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    protect, 
    authorize('admin', 'staff'), 
    advancedResults(
      Order,
      {
        path: 'user',
        select: 'name email'
      }
    ),
    getOrders
  )
  .post(protect, createOrder);

router.route('/myorders').get(protect, getMyOrders);

router
  .route('/:id')
  .get(protect, getOrder);

router
  .route('/:id/status')
  .put(protect, authorize('admin', 'staff'), updateOrderStatus);

module.exports = router;

// server/routes/reviews.js
const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'user',
      select: 'name'
    }),
    getReviews
  )
  .post(protect, addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;

// server/routes/categories.js
const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categories');

const Category = require('../models/Category');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(Category), getCategories)
  .post(protect, authorize('admin'), createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;

// server/routes/inventory.js
const express = require('express');
const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockItems
} = require('../controllers/inventory');

const Inventory = require('../models/Inventory');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    protect,
    authorize('admin', 'staff'),
    advancedResults(Inventory),
    getInventoryItems
  )
  .post(protect, authorize('admin'), createInventoryItem);

router
  .route('/lowstock')
  .get(protect, authorize('admin', 'staff'), getLowStockItems);

router
  .route('/:id')
  .get(protect, authorize('admin', 'staff'), getInventoryItem)
  .put(protect, authorize('admin'), updateInventoryItem)
  .delete(protect, authorize('admin'), deleteInventoryItem);

router
  .route('/:id/stock')
  .put(protect, authorize('admin', 'staff'), updateStock);

module.exports = router;