const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },

    
    appointmentDate: {
      type: Date,
      required: true
    },
fees: {
  type: Number,
  default:0
},

    
    timeSlot: {
      start: {
        type: String, 
        required: true
      },
      end: {
        type: String, 
        required: true
      }
    },

    status: {
      type: String,
      enum: ["pending", "approved", "cancelled", "completed"],
      default: "pending",
    },

    reason: {
      type: String,
    },
    
  },

);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports= Appointment 