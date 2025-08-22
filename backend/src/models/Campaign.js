const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['inbound', 'outbound', 'hybrid'],
    required: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    enum: [
      'healthcare', 'finance', 'insurance', 'real_estate', 'legal',
      'automotive', 'home_services', 'education', 'technology', 'retail',
      'travel', 'food_beverage', 'fitness', 'beauty', 'other'
    ]
  },
  targetAudience: {
    ageRange: {
      min: { type: Number, min: 18, max: 100 },
      max: { type: Number, min: 18, max: 100 }
    },
    gender: {
      type: String,
      enum: ['all', 'male', 'female']
    },
    locations: [{
      country: String,
      state: String,
      city: String,
      zipCode: String
    }],
    interests: [String],
    incomeLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'luxury']
    }
  },
  budget: {
    daily: {
      type: Number,
      required: [true, 'Daily budget is required'],
      min: [1, 'Daily budget must be at least $1']
    },
    total: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [1, 'Total budget must be at least $1']
    },
    spent: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: function() {
        return this.budget.total;
      }
    }
  },
  callSettings: {
    maxCallDuration: {
      type: Number,
      default: 300, // 5 minutes in seconds
      min: [60, 'Minimum call duration is 1 minute'],
      max: [3600, 'Maximum call duration is 1 hour']
    },
    minCallDuration: {
      type: Number,
      default: 30, // 30 seconds
      min: [15, 'Minimum call duration is 15 seconds']
    },
    callQuality: {
      type: String,
      enum: ['standard', 'high', 'premium'],
      default: 'standard'
    },
    recording: {
      enabled: { type: Boolean, default: true },
      retention: { type: Number, default: 90 } // days
    }
  },
  phoneNumbers: [{
    number: {
      type: String,
      required: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    type: {
      type: String,
      enum: ['toll_free', 'local', 'vanity'],
      default: 'local'
    },
    isActive: { type: Boolean, default: true },
    assignedAt: { type: Date, default: Date.now }
  }],
  tracking: {
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
    customParameters: mongoose.Schema.Types.Mixed
  },
  performance: {
    totalCalls: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    averageDuration: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    costPerCall: { type: Number, default: 0 },
    revenuePerCall: { type: Number, default: 0 },
    roi: { type: Number, default: 0 }
  },
  schedule: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    timeZone: {
      type: String,
      default: 'UTC'
    },
    activeHours: {
      start: { type: String, default: '09:00' }, // 24-hour format
      end: { type: String, default: '17:00' }
    },
    activeDays: {
      type: [String],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  },
  autoOptimization: {
    enabled: { type: Boolean, default: false },
    rules: [{
      condition: String,
      action: String,
      threshold: Number
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for campaign duration
campaignSchema.virtual('duration').get(function() {
  if (this.schedule.startDate && this.schedule.endDate) {
    return Math.ceil((this.schedule.endDate - this.schedule.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for budget utilization
campaignSchema.virtual('budgetUtilization').get(function() {
  if (this.budget.total > 0) {
    return (this.budget.spent / this.budget.total) * 100;
  }
  return 0;
});

// Virtual for campaign efficiency
campaignSchema.virtual('efficiency').get(function() {
  if (this.performance.totalCalls > 0) {
    return this.performance.revenuePerCall / this.performance.costPerCall;
  }
  return 0;
});

// Indexes for better query performance
campaignSchema.index({ userId: 1, status: 1 });
campaignSchema.index({ industry: 1, status: 1 });
campaignSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
campaignSchema.index({ createdAt: -1 });

// Pre-save middleware to update remaining budget
campaignSchema.pre('save', function(next) {
  if (this.isModified('budget.spent')) {
    this.budget.remaining = this.budget.total - this.budget.spent;
  }
  next();
});

// Method to check if campaign is active
campaignSchema.methods.isActive = function() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  return this.status === 'active' &&
         now >= this.schedule.startDate &&
         now <= this.schedule.endDate &&
         this.schedule.activeDays.includes(currentDay) &&
         currentTime >= this.schedule.activeHours.start &&
         currentTime <= this.schedule.activeHours.end;
};

// Method to update performance metrics
campaignSchema.methods.updatePerformance = function(callData) {
  this.performance.totalCalls += 1;
  this.performance.totalDuration += callData.duration || 0;
  this.performance.averageDuration = this.performance.totalDuration / this.performance.totalCalls;
  
  if (callData.cost) {
    this.budget.spent += callData.cost;
    this.performance.costPerCall = this.budget.spent / this.performance.totalCalls;
  }
  
  if (callData.revenue) {
    this.performance.revenuePerCall = (this.performance.revenuePerCall * (this.performance.totalCalls - 1) + callData.revenue) / this.performance.totalCalls;
    this.performance.roi = (this.performance.revenuePerCall - this.performance.costPerCall) / this.performance.costPerCall * 100;
  }
};

module.exports = mongoose.model('Campaign', campaignSchema);