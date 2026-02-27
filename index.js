require("dotenv").config()
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");

const express = require("express");
const app = express();

const cors = require("cors")
app.use(cors());

const connectDB = require("./config/database");
connectDB();

const bcrypt = require("bcryptjs");
const User = require("./Model/user");
const Appointment = require("./Model/appointment");

app.use(express.json());
app.use(express.urlencoded({ extended: true }))




const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "light");
    req.user = decoded;
    next();
  } catch (error) {
     return res.status(401).json({ message: "Invalid token" });
  }
};




app.get("/", authMiddleware, async function (req, res) {
  const alluser = await User.find();
  res.json({ message: "All users", data: alluser })
})




app.post("/register", async (req, res) => {
  const { name, email, password, specialization, role } = req.body
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.json({ message: "User already exists" })
  }

  const salt = await bcrypt.genSalt(10)
  const hashpass = await bcrypt.hash(password, salt)
  let status = "approved"

  if (role === "doctor") {
    status = "pending"
  }

  const user = await User.create({ name, email, password: hashpass, specialization, role, status })

  res.json({
    message:
      role === "doctor"
        ? "Doctor registered, waiting for admin approval"
        : "Registered successfully",
    data: user
  })
})




app.post("/login", async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    return res.json({ message: "User not found" })
  }

  if (user.role === "doctor" && user.status !== "approved") {
    return res.json({ message: "Admin approval pending" })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.json({ message: "Wrong password" })
  }

  const token = jwt.sign({ id: user._id, role: user.role }, "light",)

  res.json({
    message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
})




const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};




app.get("/pending-doctors", authMiddleware,adminOnly, async (req, res) => {
  const doctors = await User.find({ role: "doctor", status: "pending" })
  res.json(doctors)
})




app.put("/approve-doctor/:id", authMiddleware, adminOnly, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "approved" })
  res.json({
    message: "Doctor approved successfully"
  })
})




app.put("/reject-doctor/:id", authMiddleware, adminOnly, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "rejected" })
  res.json({
    message: "Doctor reject successfully"
  })
})




app.get("/doctors", async (req, res) => {
  const doctors = await User.find({ role: "doctor", status: "approved" });
  res.json(doctors);
});




app.get("/doctors-by-speciality/:speciality", async (req, res) => {
  try {
    const { speciality } = req.params;

    const doctors = await User.find({ role: "doctor", status: "approved", speciality: speciality, })
      .select("_id name speciality experience fees");

    res.json(doctors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctors by speciality",
    });
  }
});




app.get("/total-patient", async (req, res) => {
  const patient = await User.find({ role: "patient" })
  res.json(patient);
})




app.get("/pending-patient", async (req, res) => {
  const doctors = await User.find({ role: "patient" })
  res.json(doctors)
})




app.put("/approve-patient/:id",authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "approved" })
  res.json({
    message: "patient approved successfully"
  })
})




// app.get("/patients", async (req, res) => {
//   try {
//     const patients = await User.find(); 
//     res.json(patients);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });




app.get("/my-appointments", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user.id,
    }).populate("doctorId", "name email");

    res.json(appointments);
  } catch (error) {
    console.error(" MY-APPOINTMENTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});




app.get("/doctor/approved-appointments", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: new mongoose.Types.ObjectId(req.user.id),
      status: "approved",
    }).populate("patientId", "name email");
     res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.get("/doctor/patients/male", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Doctor only" });
    }

    const appointments = await Appointment.find({
      doctorId: req.user.id,
      gender: "male"  ,
      status: "approved"
    }).populate("patientId", "name email");

    const malePatients = appointments.map(a => ({
      _id: a.patientId._id,
      name: a.patientId.name,
      email: a.patientId.email,
      gender: a.gender
    }));

    res.json(malePatients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});




app.get("/doctor/patients/female", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Doctor only" });
    }

    const appointments = await Appointment.find({
      doctorId: req.user.id,
      gender: "female"    ,
      status: "approved"

    }).populate("patientId", "name email");

    const femalePatients = appointments.map(a => ({
      _id: a.patientId._id,
      name: a.patientId.name,
      email: a.patientId.email,
      gender: a.gender
    }));

    res.json(femalePatients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});




app.get("/doctor/pending-appointments", authMiddleware, async (req, res) => {
  try {
    
    if (!req.user || req.user.role !== "doctor") {
      return res.status(403).json({ message: "Doctor only" });
    }

    const appointments = await Appointment.find({
      doctorId: req.user.id,
      status: "pending",
    }).populate("patientId", "name email");

    res.status(200).json(appointments);

  } catch (error) {
    console.error("DOCTOR APPOINTMENTS ERROR ", error);
    res.status(500).json({ message: "Server error",reqror: error.message});
  }
});

app.get("/doctor/total-earning", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "doctor") {
      return res.status(403).json({ message: "Doctor only" });
    }

    const appointments = await Appointment.find({
      doctorId: req.user.id,
      status: "completed" 
    }).lean();

    let totalEarning = 0;

    appointments.forEach(a => {
      totalEarning += Number(a.fees || 0);
    });

    res.json({
      totalAppointments: appointments.length,
      totalEarning
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.get("/doctor/:id", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
      .select("availableDays");

    res.json({
      availableDays: doctor?.availableDays || []
    });
  } catch (error) {
    res.status(500).json({ message: "Doctor not found" });
  }
});




app.put("/reject-patient/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "rejected" })
  res.json({
    message: "patient reject successfully"
  })
})




app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});




app.put("/profile", authMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});




app.post("/appointment/book", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    const {
      doctorId,appointmentDate,timeSlot,   name,email, age,gender,reason
    } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot?.start || !timeSlot?.end) {
      return res.status(400).json({
        message: "doctorId, appointmentDate and timeSlot are required"
      });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const localDate = new Date(appointmentDate + "T00:00:00");
    const dayName = localDate.toLocaleString("en-US", { weekday: "long" });

    if (!doctor.availableDays?.includes(dayName)) {
      return res.status(400).json({
        message: "Doctor not available on this day"
      });
    }

const alreadyBooked = await Appointment.findOne({
  doctorId,
  appointmentDate: localDate,
  timeSlot,
  status: { $ne: "cancelled" }
});


if (alreadyBooked) {
  return res.status(400).json({
    message: "Ye time slot pehle se booked hai"
  });
}


    const appointment = await Appointment.create({
      patientId: req.user.id,  doctorId: new mongoose.Types.ObjectId(doctorId)
,appointmentDate: localDate,timeSlot, name,email,age,gender,reason ,fees: doctor.fees
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (error) {
    console.error("APPOINTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});







app.get("/appointments/booked-slots/:doctorId/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const localDate = new Date(date + "T00:00:00");

    const appointments = await Appointment.find({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      appointmentDate: localDate,
      status: { $ne: "cancelled" }
    });

    const bookedSlots = appointments.map(a =>
      `${a.timeSlot.start}-${a.timeSlot.end}`
    );

    res.json(bookedSlots);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.get("/admin/appointments", authMiddleware, adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name email specialization");
    res.json({ success: true, appointments, });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.get( "/admin/today-appointments", authMiddleware, adminOnly, async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: "approved"
    })
    .populate("patientId", "name email")
      .populate("doctorId", "name email");

    res.json(appointments);
  }
);




app.put("/appointment/approve/:id", authMiddleware, async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );

  console.log("APPROVED APPOINTMENT ", appointment);
  res.json(appointment);
});


app.put("/appointment/complete/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctor can complete appointment" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Appointment marked as completed",
      appointment
    });

  } catch (error) {
    console.error("COMPLETE APPOINTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});



app.put("/doctor/availability", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctor allowed" });
    }

    const { availableDays, timeSlots } = req.body;

    if (!availableDays || !timeSlots) {
      return res.status(400).json({ message: "Days and time slots required" });
    }

    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { availableDays, timeSlots },
      { new: true }
    );

    res.json({
      message: "Availability updated successfully",
      doctor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




app.put("/appointment/reject/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Only doctor can reject" });
  }
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });

  res.json({
    message: "Appointment rejected",
    data: appointment
  });
});




app.listen("8500", async function (req, res) {
  console.log("server is connected on port 8500")
})