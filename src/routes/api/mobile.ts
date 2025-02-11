import { Router } from "express";
import { MobileAPI } from "@/lib/api/mobile";

const router = Router();

// Middleware to validate device type
const validateDeviceType = (requiredType: "victim" | "responder") => {
  return async (req: any, res: any, next: any) => {
    try {
      const validation = await MobileAPI.validateToken(req.apiToken);
      if (validation?.device_type !== requiredType) {
        return res.status(403).json({ error: "Unauthorized device type" });
      }
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
};

// Middleware to validate API token
const validateToken = (req: any, res: any, next: any) => {
  const token = req.headers["x-api-token"];
  if (!token) {
    return res.status(401).json({ error: "API token required" });
  }
  req.apiToken = token;
  next();
};

// Update location
router.post("/location", validateToken, async (req, res) => {
  try {
    await MobileAPI.updateLocation(req.apiToken, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Request emergency help
router.post("/emergency", validateToken, async (req, res) => {
  try {
    const emergency = await MobileAPI.requestEmergencyHelp(
      req.apiToken,
      req.body,
    );
    res.json(emergency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update emergency status
router.post("/emergency/:id/status", validateToken, async (req, res) => {
  try {
    await MobileAPI.updateEmergencyStatus(
      req.apiToken,
      req.params.id,
      req.body.status,
    );
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get active emergency
router.get("/emergency/active", validateToken, async (req, res) => {
  try {
    const emergency = await MobileAPI.getActiveEmergency(req.apiToken);
    res.json(emergency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send message
router.post("/emergency/:id/message", validateToken, async (req, res) => {
  try {
    await MobileAPI.sendMessage(req.apiToken, req.params.id, req.body.content);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Victim-specific endpoints
router.post("/victim/register", async (req, res) => {
  try {
    const { fullName, phone, medicalInfo, emergencyContacts } = req.body;
    const token = await MobileAPI.registerVictim({
      fullName,
      phone,
      medicalInfo,
      emergencyContacts,
    });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get victim's emergency history
router.get(
  "/victim/history",
  validateToken,
  validateDeviceType("victim"),
  async (req, res) => {
    try {
      const history = await MobileAPI.getVictimHistory(req.apiToken);
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Responder-specific endpoints
router.post("/responder/register", async (req, res) => {
  try {
    const { fullName, phone, specialization, certifications } = req.body;
    const token = await MobileAPI.registerResponder({
      fullName,
      phone,
      specialization,
      certifications,
    });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update responder status
router.post(
  "/responder/status",
  validateToken,
  validateDeviceType("responder"),
  async (req, res) => {
    try {
      await MobileAPI.updateResponderStatus(req.apiToken, req.body.status);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Get responder's assignments history
router.get(
  "/responder/assignments",
  validateToken,
  validateDeviceType("responder"),
  async (req, res) => {
    try {
      const assignments = await MobileAPI.getResponderAssignments(req.apiToken);
      res.json(assignments);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Emergency details endpoint
router.get("/emergency/:id/details", validateToken, async (req, res) => {
  try {
    const details = await MobileAPI.getEmergencyDetails(
      req.apiToken,
      req.params.id,
    );
    res.json(details);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update emergency details (responders only)
router.put(
  "/emergency/:id/details",
  validateToken,
  validateDeviceType("responder"),
  async (req, res) => {
    try {
      await MobileAPI.updateEmergencyDetails(
        req.apiToken,
        req.params.id,
        req.body,
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Get nearby resources
router.get("/resources/nearby", validateToken, async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const resources = await MobileAPI.getNearbyResources(req.apiToken, {
      latitude: parseFloat(latitude as string),
      longitude: parseFloat(longitude as string),
      radius: parseFloat(radius as string),
    });
    res.json(resources);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload emergency media
router.post("/emergency/:id/media", validateToken, async (req, res) => {
  try {
    const file = req.files?.file;
    const type = req.body.type;
    const url = await MobileAPI.uploadEmergencyMedia(
      req.apiToken,
      req.params.id,
      file,
      type,
    );
    res.json({ url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get emergency media
router.get("/emergency/:id/media", validateToken, async (req, res) => {
  try {
    const media = await MobileAPI.getEmergencyMedia(
      req.apiToken,
      req.params.id,
    );
    res.json(media);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Report hazard
router.post("/hazards", validateToken, async (req, res) => {
  try {
    const hazard = await MobileAPI.reportHazard(req.apiToken, req.body);
    res.json(hazard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update victim status
router.post(
  "/emergency/:id/victim-status",
  validateToken,
  validateDeviceType("victim"),
  async (req, res) => {
    try {
      await MobileAPI.updateVictimStatus(req.apiToken, req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Get resource availability
router.get("/resources/availability", validateToken, async (req, res) => {
  try {
    const resources = await MobileAPI.getResourceAvailability(
      req.apiToken,
      req.query.type as string,
    );
    res.json(resources);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Request specialized support
router.post(
  "/emergency/:id/specialized-support",
  validateToken,
  async (req, res) => {
    try {
      const support = await MobileAPI.requestSpecializedSupport(
        req.apiToken,
        req.params.id,
        req.body.supportType,
        req.body.details,
      );
      res.json(support);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
