const Volunteer = require('../models/volunteerModel');

// 1. Create a new Volunteer Profile (Saves to Real Database!)
const createProfile = async (req, res) => {
  try {
    const { name, type, ngoName, skills } = req.body;
    
    // Create the volunteer in MongoDB
    const newVolunteer = await Volunteer.create({
      name,
      type,
      ngoName,
      skills,
      points: 0,
      rating: 0 // New volunteers start with 0 rating
    });

    res.status(201).json({ 
        message: "Profile created successfully!", 
        volunteer: newVolunteer 
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Failed to create profile" });
  }
};

// 2. View nearby tasks (Feeding the Greater Noida Heatmap)
const getNearbyTasks = async (req, res) => {
  try {
    const mockTasks = [
      {
        reportId: "REP-10045239",
        category: "Tree Plantation Drive",
        description: "Need volunteers to plant 50 neem and peepal saplings along the main avenue to improve green cover.",
        reportedBy: "Green Earth NGO",
        address: "Knowledge Park III, Greater Noida, Uttar Pradesh",
        coordinates: { lat: 28.4681, lng: 77.5140 },
        status: "Open",
        pointsReward: 100
      },
      {
        reportId: "REP-10045240",
        category: "Reflective Collar Distribution",
        description: "Several stray dogs near the Pari Chowk roundabout need reflective collars to prevent night-time road accidents.",
        reportedBy: "Aditi",
        address: "Pari Chowk, Greater Noida, Uttar Pradesh",
        coordinates: { lat: 28.4670, lng: 77.5145 },
        status: "Open",
        pointsReward: 50
      },
      {
        reportId: "REP-10045241",
        category: "Community Education Drive",
        description: "Weekend tutoring session for children of construction workers near the new college campus site. Focus on basic math and English.",
        reportedBy: "Teach For India Rep",
        address: "Knowledge Park II, Greater Noida, Uttar Pradesh",
        coordinates: { lat: 28.4665, lng: 77.5120 },
        status: "In Progress",
        pointsReward: 150
      },
      {
        reportId: "REP-10045242",
        category: "Garbage Dump / Litter Hotspot",
        description: "Large pile of uncollected plastic and wrappers near the college back gate. Perfect for a quick 2-hour weekend cleanup drive.",
        reportedBy: "Anonymous User",
        address: "Knowledge Park III, Greater Noida, Uttar Pradesh",
        coordinates: { lat: 28.4675, lng: 77.5135 },
        status: "Open",
        pointsReward: 40
      },
      {
        reportId: "REP-10045243",
        category: "Reflective Collar Distribution",
        description: "Herd of cattle often sits on the unlit service road at night. Need volunteers to safely apply reflective tape to their horns/necks.",
        reportedBy: "Rahul Sharma",
        address: "Knowledge Park III, Greater Noida, Uttar Pradesh",
        coordinates: { lat: 28.4685, lng: 77.5150 },
        status: "Open",
        pointsReward: 80
      },
      {
        reportId: "REP-10045244",
        category: "Tree Plantation Drive",
        description: "Local RWA has procured 20 saplings. Need volunteers to help dig and plant them in the neighborhood park.",
        reportedBy: "Priya Verma",
        address: "Sector Alpha 1, Greater Noida, Uttar Pradesh",
        coordinates: { lat: 28.4905, lng: 77.5310 },
        status: "Open",
        pointsReward: 60
      },
      {
        reportId: "REP-10045245",
        category: "Community Education Drive",
        description: "Donation drive! We are collecting and distributing old books, bags, and stationery at the community center.",
        reportedBy: "Anonymous User",
        address: "Sector Alpha 2, Greater Noida, Uttar Pradesh",
        coordinates: { lat: 28.4930, lng: 77.5280 },
        status: "Open",
        pointsReward: 30
      },
      {
        reportId: "REP-10045246",
        category: "Stray Animal Distress",
        description: "A cow is wandering near the market looking dehydrated. Need a volunteer to provide water and check for injuries.",
        reportedBy: "Vikas Singh",
        address: "Sector Beta 1, Greater Noida, Uttar Pradesh",
        coordinates: { lat: 28.4850, lng: 77.5350 },
        status: "Resolved",
        pointsReward: 20
      }
    ];
    res.status(200).json({ tasks: mockTasks });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// 3. "I want to help!" - Apply for a task (Real DB Logic)
const applyForTask = async (req, res) => {
  try {
    const { volunteerId, taskId } = req.body;
    
    // Step 1: Find the actual volunteer in the database
    const volunteer = await Volunteer.findById(volunteerId);
    
    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer not found in database" });
    }

    // Step 2: Auto-assign logic based on their REAL rating
    let assignmentStatus = "Pending Approval";
    if (volunteer.rating >= 4.0) {
      assignmentStatus = "Assigned";
    }

    // Step 3: Add this task to their history
    volunteer.history.push({
      taskId: null, // (We will pass the real Task ID here later when Tasks are in DB)
      status: assignmentStatus
    });
    
    await volunteer.save();

    res.status(200).json({ 
        message: `Task application received. Status: ${assignmentStatus}`,
        taskId 
    });
  } catch (error) {
    console.error("Apply task error:", error);
    res.status(500).json({ error: "Failed to apply for task" });
  }
};

// 4. Submit Image Proof & Earn Points (Real Gamification)
const submitProof = async (req, res) => {
  try {
    const { volunteerId, taskId, pointsEarned } = req.body;
    // Note: multer logic for req.files will go here later
    
    // Find volunteer, add their newly earned points, and increment completed tasks
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { 
        $inc: { points: pointsEarned || 10, tasksCompleted: 1 } 
      },
      { new: true } // Return the updated profile
    );

    if (!updatedVolunteer) {
        return res.status(404).json({ error: "Volunteer not found" });
    }

    res.status(200).json({ 
        message: "Proof submitted successfully. Task completed!",
        totalPoints: updatedVolunteer.points // Show their new total score!
    });
  } catch (error) {
    console.error("Submit proof error:", error);
    res.status(500).json({ error: "Failed to submit proof" });
  }
};

module.exports = {
  createProfile,
  getNearbyTasks,
  applyForTask,
  submitProof
};
