// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'staff', 'admin'],
    default: 'customer'
  },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  phoneNumber: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

// server/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', CategorySchema);

// server/models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  discountPrice: {
    type: Number
  },
  image: {
    type: String,
    required: [true, 'Please add an image']
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  preparationTime: {
    type: Number,
    default: 15 // minutes
  },
  ingredients: [String],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    allergens: [String]
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spicyLevel: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  },
  customizationOptions: [{
    name: String,
    options: [{
      name: String,
      price: Number
    }]
  }],
  tags: [String],
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numberOfRatings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);

// server/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1']
    },
    customizations: [{
      option: String,
      choice: String,
      extraPrice: Number
    }]
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit-card', 'paypal', 'stripe'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  deliveryType: {
    type: String,
    enum: ['delivery', 'pickup'],
    required: true
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  deliveryInstructions: {
    type: String
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  specialInstructions: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add current status to history before saving
OrderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: Date.now()
    });
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);

// server/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  menuItem: {
    type: mongoose.Schema.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per menu item
ReviewSchema.index({ menuItem: 1, user: 1 }, { unique: true });

// Static method to get average rating of a menu item
ReviewSchema.statics.getAverageRating = async function(menuItemId) {
  const obj = await this.aggregate([
    {
      $match: { menuItem: menuItemId }
    },
    {
      $group: {
        _id: '$menuItem',
        averageRating: { $avg: '$rating' },
        numberOfRatings: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await this.model('MenuItem').findByIdAndUpdate(menuItemId, {
        averageRating: obj[0].averageRating.toFixed(1),
        numberOfRatings: obj[0].numberOfRatings
      });
    } else {
      await this.model('MenuItem').findByIdAndUpdate(menuItemId, {
        averageRating: 0,
        numberOfRatings: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.menuItem);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.menuItem);
});

module.exports = mongoose.model('Review', ReviewSchema);

// server/models/Inventory.js
const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add inventory item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  currentStock: {
    type: Number,
    required: [true, 'Please add current stock']
  },
  unit: {
    type: String,
    required: [true, 'Please specify the unit'],
    enum: ['kg', 'g', 'l', 'ml', 'pieces', 'packets']
  },
  minStockLevel: {
    type: Number,
    required: [true, 'Please add minimum stock level']
  },
  category: {
    type: String,
    enum: ['ingredients', 'packaging', 'beverages', 'misc'],
    default: 'ingredients'
  },
  cost: {
    type: Number,
    required: [true, 'Please add cost per unit']
  },
  supplier: {
    name: String,
    contactInfo: String
  },
  affectedMenuItems: [{
    type: mongoose.Schema.ObjectId,
    ref: 'MenuItem'
  }],
  stockHistory: [{
    action: {
      type: String,
      enum: ['added', 'removed', 'adjusted'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  expirationDate: {
    type: Date
  },
  location: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inventory', InventorySchema);

// server/models/Coupon.js
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Please specify the coupon type']
  },
  value: {
    type: Number,
    required: [true, 'Please add a discount value']
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'Please add an expiration date']
  },
  usageLimit: {
    type: Number
  },
  usedCount: {
    type: Number,
    default: 0
  },
  applicableItems: [{
    type: mongoose.Schema.ObjectId,
    ref: 'MenuItem'
  }],
  applicableCategories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Coupon', CouponSchema);