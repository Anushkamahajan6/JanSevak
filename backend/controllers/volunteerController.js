// Note: We are using mock data here until your teammate finishes the MongoDB connection!

// 1. Create a new Volunteer Profile
export const createProfile = async (req, res) => {
  try {
    const { name, type, ngoName } = req.body;
    // TODO: Later, save to MongoDB using volunteerModel
    res.status(201).json({ 
        message: "Profile created successfully", 
        volunteer: { id: "v123", name, type, ngoName, points: 0 } 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create profile" });
  }
};

// 2. View nearby tasks (Waiting on Heatmap integration)
export const getNearbyTasks = async (req, res) => {
  try {
    // Mock data for frontend to test
    const mockTasks = [
      { id: "t1", title: "Trash pickup on 5th St", location: "5th St", status: "Open" },
      { id: "t2", title: "Park cleanup", location: "Central Park", status: "Open" }
    ];
    res.status(200).json({ tasks: mockTasks });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// 3. "I want to help!" - Apply for a task
export const applyForTask = async (req, res) => {
  try {
    const { volunteerId, taskId } = req.body;
    
    // Logic from your notes: Auto-assign based on rating, else wait for approval
    const mockVolunteerRating = 4.5; 
    let assignmentStatus = "Pending Approval (Wait)";

    if (mockVolunteerRating >= 4.0) {
      assignmentStatus = "Auto-Assigned";
    }

    res.status(200).json({ 
        message: `Task application received. Status: ${assignmentStatus}`,
        taskId 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to apply for task" });
  }
};

// 4. Submit Image Proof (Before/After) & Time
export const submitProof = async (req, res) => {
  try {
    const { volunteerId, taskId, timeOfCompletion } = req.body;
    // Note: Later you will use 'multer' to handle the actual image files from req.files
    
    // Gamification logic: Add points on completion
    const pointsEarned = 10; 

    res.status(200).json({ 
        message: "Proof submitted successfully. Task completed!",
        pointsEarned,
        timeOfCompletion
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit proof" });
  }
};