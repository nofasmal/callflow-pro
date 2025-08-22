const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  callId: {
    type: String,
    required: true,
    unique: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'answered', 'completed', 'failed', 'no_answer', 'busy'],
    default: 'initiated'
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  from: {
    number: {
      type: String,
      required: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    name: String,
    location: {
      country: String,
      state: String,
      city: String,
      zipCode: String
    }
  },
  to: {
    number: {
      type: String,
      required: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    name: String,
    location: {
      country: String,
      state: String,
      city: String,
      zipCode: String
    }
  },
  timing: {
    initiatedAt: { type: Date, default: Date.now },
    ringingAt: Date,
    answeredAt: Date,
    endedAt: Date,
    duration: { type: Number, default: 0 }, // in seconds
    waitTime: { type: Number, default: 0 } // time to answer in seconds
  },
  quality: {
    score: { type: Number, min: 1, max: 5 },
    issues: [{
      type: String,
      enum: ['echo', 'noise', 'dropped', 'poor_audio', 'delay', 'none']
    }],
    recordingUrl: String,
    transcription: String
  },
  cost: {
    perMinute: { type: Number, required: true, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  revenue: {
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    source: String // lead generation, sale, etc.
  },
  leadData: {
    isQualified: { type: Boolean, default: false },
    qualificationScore: { type: Number, min: 0, max: 100 },
    interests: [String],
    budget: {
      min: Number,
      max: Number,
      currency: String
    },
    timeline: {
      type: String,
      enum: ['immediate', '1_month', '3_months', '6_months', '1_year', 'unknown']
    },
    notes: String,
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date
  },
  tracking: {
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
    referrer: String,
    userAgent: String,
    ipAddress: String,
    deviceType: String
  },
  tags: [String],
  notes: String,
  isTest: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for call profitability
callSchema.virtual('profitability').get(function() {
  if (this.cost.total > 0) {
    return this.revenue.amount - this.cost.total;
  }
  return 0;
});

// Virtual for ROI
callSchema.virtual('roi').get(function() {
  if (this.cost.total > 0) {
    return ((this.revenue.amount - this.cost.total) / this.cost.total) * 100;
  }
  return 0;
});

// Virtual for call efficiency
callSchema.virtual('efficiency').get(function() {
  if (this.timing.duration > 0) {
    return this.revenue.amount / (this.timing.duration / 60); // revenue per minute
  }
  return 0;
});

// Indexes for better query performance
callSchema.index({ campaignId: 1, status: 1 });
callSchema.index({ userId: 1, createdAt: -1 });
callSchema.index({ 'from.number': 1, 'to.number': 1 });
callSchema.index({ status: 1, 'timing.initiatedAt': -1 });
callSchema.index({ 'timing.initiatedAt': -1 });

// Pre-save middleware to calculate costs and duration
callSchema.pre('save', function(next) {
  // Calculate duration if call is completed
  if (this.timing.answeredAt && this.timing.endedAt) {
    this.timing.duration = Math.floor((this.timing.endedAt - this.timing.answeredAt) / 1000);
  }
  
  // Calculate wait time if call was answered
  if (this.timing.ringingAt && this.timing.answeredAt) {
    this.timing.waitTime = Math.floor((this.timing.answeredAt - this.timing.ringingAt) / 1000);
  }
  
  // Calculate total cost based on duration
  if (this.timing.duration > 0 && this.cost.perMinute > 0) {
    this.cost.total = (this.timing.duration / 60) * this.cost.perMinute;
  }
  
  next();
});

// Method to update call status
callSchema.methods.updateStatus = function(newStatus, timestamp = new Date()) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'ringing':
      this.timing.ringingAt = timestamp;
      break;
    case 'answered':
      this.timing.answeredAt = timestamp;
      break;
    case 'completed':
    case 'failed':
    case 'no_answer':
    case 'busy':
      this.timing.endedAt = timestamp;
      break;
  }
};

// Method to calculate lead qualification score
callSchema.methods.calculateQualificationScore = function() {
  let score = 0;
  
  // Duration-based scoring
  if (this.timing.duration >= 300) score += 25; // 5+ minutes
  else if (this.timing.duration >= 180) score += 15; // 3+ minutes
  else if (this.timing.duration >= 60) score += 10; // 1+ minute
  
  // Quality-based scoring
  if (this.quality.score >= 4) score += 20;
  else if (this.quality.score >= 3) score += 10;
  
  // Revenue-based scoring
  if (this.revenue.amount > 0) score += 30;
  
  // Budget indication
  if (this.leadData.budget && this.leadData.budget.min > 1000) score += 15;
  
  this.leadData.qualificationScore = Math.min(score, 100);
  this.leadData.isQualified = score >= 70;
  
  return score;
};

// Static method to get call statistics
callSchema.statics.getStats = async function(userId, dateRange = {}) {
  const match = { userId };
  
  if (dateRange.start) match.createdAt = { $gte: dateRange.start };
  if (dateRange.end) match.createdAt = { ...match.createdAt, $lte: dateRange.end };
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalDuration: { $sum: '$timing.duration' },
        totalCost: { $sum: '$cost.total' },
        totalRevenue: { $sum: '$revenue.amount' },
        averageDuration: { $avg: '$timing.duration' },
        qualifiedLeads: { $sum: { $cond: ['$leadData.isQualified', 1, 0] } }
      }
    }
  ]);
};

module.exports = mongoose.model('Call', callSchema);