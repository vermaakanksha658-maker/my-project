const mongoose = require("mongoose")

const userSchema = mongoose.Schema({


   name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,   
  phone: String,
  dob: Date,
  
  age: Number,
  gender: String,
  address: String,
  city: String,
  state: String,
  speciality: {
    type: String,
    enum: ["Cardiologist","Dermatologist","Neurologist","Orthopedic","Pediatrician","Psychiatrist","Gynecologist","ENT Specialist","Dentist","General Physician",
    ],
  },
  availableDays: {
    type: [String],
    enum:{
    values: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    message: "Invalid day selected"
  },
  default: []
  },
  
  experience: Number,

    role: {
        type: String,
        enum:["admin","doctor","patient"],
        default: "patient"
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
   timeSlots: {
  type: [
    {
      start: {
        type: String
      },
      end: {
        type: String
      }
    }
  ],
  default: []  
},

fees: {
  type: Number,
  required: true
}
,
  dateAvailability: [
    {
      date: {
        type: Date,
        required: true
      },
    
      isAvailable: {
        type: Boolean,
        default: false
      }
    }
  ]

}, { timestamps: true 

})
const User = mongoose.model("User", userSchema)
module.exports = User