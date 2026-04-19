import multer from 'multer';
import path from 'path';
import Grievance from '../models/Grievance.js';

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
}).single('photo');

export const createGrievance = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    try {
      const {
        complainantName,
        complainantMobile,
        ivrMobile,
        category,
        description,
        address,
        lat,
        lng,
        department
      } = req.body;

      const grievanceId = `GRV${String(Date.now()).slice(-6)}`;

      const newGrievance = new Grievance({
        grievanceId,
        complainantName,
        complainantMobile,
        ivrMobile: ivrMobile || complainantMobile,
        category,
        description,
        location: {
          address,
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        department: department || 'General'
      });

      await newGrievance.save();

      res.status(201).json({
        message: 'Grievance submitted successfully',
        grievance: newGrievance
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while submitting grievance' });
    }
  });
};

export const getCitizenGrievances = async (req, res) => {
  try {
    const { mobile } = req.params;
    const grievances = await Grievance.find({ complainantMobile: mobile }).sort({ createdAt: -1 });
    res.status(200).json(grievances);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching grievances' });
  }
};

export const getDeptGrievances = async (req, res) => {
  try {
    const { department } = req.params;
    const grievances = await Grievance.find({ department }).sort({ createdAt: -1 });
    res.status(200).json(grievances);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching dept grievances' });
  }
};

export const getFieldTasks = async (req, res) => {
  try {
    const { department } = req.params;
    
    // If department is "undefined" strings or null, fetch global pending tasks
    const isInvalidDept = !department || department === 'undefined' || department === 'null' || department === '' || department === '_all';
    
    const query = !isInvalidDept
      ? { department, status: 'resolved_pending_verification' }
      : { status: 'resolved_pending_verification' };

    const tasks = await Grievance.find(query).sort({ updatedAt: -1 });
    
    // Also fetch recently completed verifications for this officer
    const completedQuery = !isInvalidDept
      ? { department, status: 'verified_resolved' }
      : { status: 'verified_resolved' };
    
    const completed = await Grievance.find(completedQuery).limit(20).sort({ updatedAt: -1 });

    res.status(200).json({ tasks, completed });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching field tasks' });
  }
};

export const updateGrievanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote, officerId } = req.body;

    const grievance = await Grievance.findOneAndUpdate(
      { grievanceId: id },
      { 
        status,
        $push: { 
          resolutionAttempts: { 
            updatedAt: new Date(), 
            note: resolutionNote, 
            status 
          } 
        } 
      },
      { new: true }
    );

    if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

    res.status(200).json(grievance);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating status' });
  }
};

export const submitFieldVerification = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err });

    try {
      const { id } = req.params;
      const { visitNotes, lat, lng, officerId } = req.body;

      const grievance = await Grievance.findOne({ grievanceId: id });
      if (!grievance) return res.status(404).json({ message: 'Grievance not found' });

      grievance.status = 'verified_resolved';
      grievance.resolutionAttempts.push({
        updatedAt: new Date(),
        note: `Field verification completed: ${visitNotes}`,
        status: 'verified_resolved'
      });

      // Update location log if needed or just store current verification point
      if (req.file) {
        // Here we might want to store multiple images, but for now we update the main one or a specific field photo
        // For simplicity, we'll just track that it was verified
      }

      await grievance.save();
      res.status(200).json(grievance);
    } catch (error) {
      res.status(500).json({ message: 'Server error during field verification' });
    }
  });
};

export const getCollectorStats = async (req, res) => {
  try {
    const grievances = await Grievance.find();
    
    // Aggregation logic forCollector
    const deptStats = {};
    grievances.forEach(g => {
      if (!deptStats[g.department]) {
        deptStats[g.department] = { total: 0, resolved: 0, reopened: 0 };
      }
      deptStats[g.department].total++;
      if (g.status === 'verified_resolved') deptStats[g.department].resolved++;
      if (g.status === 'auto_reopened') deptStats[g.department].reopened++;
    });

    const formattedDeptStats = Object.keys(deptStats).map(name => {
      const stats = deptStats[name];
      const qualityScore = stats.total > 0 
        ? Math.round(((stats.resolved) / (stats.total + stats.reopened)) * 100) 
        : 100;
        
      return {
        name,
        total: stats.total,
        resolved: stats.resolved,
        reopened: stats.reopened,
        qualityScore
      };
    });

    res.status(200).json({
      totalGrievances: grievances.length,
      pendingVerifications: grievances.filter(g => g.status === 'resolved_pending_verification').length,
      autoReopens: grievances.filter(g => g.status === 'auto_reopened').length,
      departments: formattedDeptStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching collector stats' });
  }
};
