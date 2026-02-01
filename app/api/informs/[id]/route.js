import { connectDB } from "@/lib/db";
import Inform from "@/models/Inform";
import { verifyToken } from "@/lib/auth";
import "@/models/User";
import "@/models/Tool";

export async function GET(req, { params }) {
  console.log("=== GET /api/informs/[id] START ===");
  console.log("1. Connecting to database...");
  
  await connectDB();
  console.log("2. Database connected");

  console.log("3. Verifying authentication...");
  let auth;
  try {
    auth = verifyToken(req);
    console.log("4. Auth successful:", { id: auth.id, role: auth.role });
  } catch (error) {
    console.error("4. Auth ERROR:", error.message);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("5. Checking user role...");
  if (auth.role !== "admin" && auth.role !== "user") {
    console.log("6. Role check FAILED - user role:", auth.role);
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  console.log("6. Role check PASSED");

  try {
    console.log("7. Getting params...");
    
    // FIX: params is a Promise, so we need to await it
    const resolvedParams = await params;
    console.log("7a. Resolved params object:", resolvedParams);
    console.log("7b. Type of resolved params:", typeof resolvedParams);
    console.log("7c. Keys in resolved params:", Object.keys(resolvedParams));
    
    // Now we can safely destructure from the resolved params
    const { id } = resolvedParams;
    console.log("8. Extracted ID:", id);
    console.log("8a. ID type:", typeof id);
    console.log("8b. ID length:", id?.length);
    
    // Better ID validation
    console.log("9. Validating ID...");
    if (!id) {
      console.log("9a. ID is missing or falsy");
      return Response.json(
        { error: "Invalid inform ID format - ID is required" },
        { status: 400 }
      );
    }
    
    if (typeof id !== 'string') {
      console.log("9b. ID is not a string, type is:", typeof id);
      return Response.json(
        { error: "Invalid inform ID format - must be string" },
        { status: 400 }
      );
    }
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("9c. ID doesn't match MongoDB ObjectId pattern");
      console.log("9d. ID value:", id);
      console.log("9e. Regex test result:", /^[0-9a-fA-F]{24}$/.test(id));
      return Response.json(
        { error: "Invalid inform ID format" },
        { status: 400 }
      );
    }
    
    console.log("9f. ID validation PASSED");

    console.log("10. Querying database for inform with ID:", id);
    const inform = await Inform.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .populate('tool', 'toolNumber toolId client bayArea')
      .lean();
    
    console.log("11. Database query completed");
    
    if (!inform) {
      console.log("12. Inform NOT FOUND in database");
      console.log("12a. Searched ID:", id);
      console.log("12b. Checking if connection is alive...");
      // Try a simple query to check DB connection
      const count = await Inform.countDocuments({});
      console.log("12c. Total informs in database:", count);
      return Response.json({ error: "Inform not found" }, { status: 404 });
    }
    
    console.log("12. Inform FOUND:", {
      _id: inform._id,
      title: inform.title,
      createdBy: inform.createdBy,
    });

    console.log("13. Checking permissions...");
    console.log("13a. Auth ID:", auth.id);
    console.log("13b. Auth role:", auth.role);
    console.log("13c. Created by ID:", inform.createdBy?._id?.toString());
   
    if (
      auth.role !== "admin" && 
      inform.createdBy._id.toString() !== auth.id 
    ) {
      console.log("14. Permission check FAILED");
      console.log("14a. User is not admin");
      console.log("14b. User is not creator:", inform.createdBy._id.toString() !== auth.id);
      return Response.json(
        { error: "You don't have permission to view this inform" },
        { status: 403 }
      );
    }
    
    console.log("14. Permission check PASSED");

    console.log("15. Preparing response...");
    const response = {
      ...inform,
      isAdmin: auth.role === "admin"
    };
    
    console.log("16. Response ready, sending...");
    console.log("17. Response has keys:", Object.keys(response));
    console.log("=== GET /api/informs/[id] END ===");
    
    return Response.json(response);
  } catch (error) {
    console.error("=== GET ERROR ===");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", error);
    
    // Handle CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      console.log("CastError detected - invalid ObjectId");
      return Response.json(
        { error: "Invalid inform ID" },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  console.log("=== PATCH /api/informs/[id] START ===");
  
  await connectDB();
  console.log("1. Database connected");

  console.log("2. Verifying authentication...");
  let auth;
  try {
    auth = verifyToken(req);
    console.log("3. Auth successful:", { id: auth.id, role: auth.role });
  } catch (error) {
    console.error("3. Auth ERROR:", error.message);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("4. Getting params...");
    
    // FIX: params is a Promise, so we need to await it
    const resolvedParams = await params;
    console.log("5. Resolved params:", resolvedParams);
    
    const { id } = resolvedParams;
    console.log("6. Extracted ID:", id);
    
    // Validate ID
    if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("7. ID validation FAILED");
      return Response.json(
        { error: "Invalid inform ID format" },
        { status: 400 }
      );
    }
    console.log("7. ID validation PASSED");

    console.log("8. Parsing request body...");
    const data = await req.json();
    console.log("9. Request body:", data);

    // Validate request body
    if (!data || Object.keys(data).length === 0) {
      console.log("10. Request body validation FAILED - no data");
      return Response.json(
        { error: "No data provided" },
        { status: 400 }
      );
    }
    console.log("10. Request body validation PASSED");

    console.log("11. Finding inform in database...");
    const inform = await Inform.findById(id);
    
    if (!inform) {
      console.log("12. Inform NOT FOUND");
      return Response.json({ error: "Inform not found" }, { status: 404 });
    }
    
    console.log("12. Inform found:", {
      _id: inform._id,
      status: inform.status,
      createdBy: inform.createdBy,
    });

    console.log("13. Checking edit permissions...");
    if (
      auth.role !== "admin" &&
      inform.createdBy.toString() !== auth.id
      
    ) {
      console.log("14. Permission check FAILED");
      return Response.json(
        { error: "You don't have permission to edit this inform" },
        { status: 403 }
      );
    }
    console.log("14. Permission check PASSED");

    // Lock editing if completed (admin can still edit)
    if (inform.status === "COMPLETED" && auth.role !== "admin") {
      console.log("15. Inform is COMPLETED and user is not admin - LOCKED");
      return Response.json(
        { error: "This inform is completed and locked for editing" },
        { status: 403 }
      );
    }
    console.log("15. Edit lock check PASSED");

    // Status changes require admin privileges
    if (data.status && auth.role !== "admin") {
      console.log("16. Status change attempted by non-admin");
      return Response.json(
        { error: "Only admins can change inform status" },
        { status: 403 }
      );
    }
    console.log("16. Status change check PASSED");

    // Prevent changing createdBy field
    delete data.createdBy;
    console.log("17. Removed createdBy from update data");

    console.log("18. Updating inform with data:", data);
    Object.assign(inform, data);
    inform.lastEditedBy = auth.id;
    inform.updatedAt = new Date();

    console.log("19. Saving inform...");
    await inform.save();
    console.log("20. Inform saved successfully");

    console.log("21. Fetching populated inform...");
    const populatedInform = await Inform.findById(inform._id)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .populate('tool', 'toolNumber toolId client bayArea')
      .lean();

    console.log("22. Preparing response...");
    const response = {
      ...populatedInform,
      isAdmin: auth.role === "admin"
    };

    console.log("=== PATCH /api/informs/[id] END ===");
    return Response.json(response);
  } catch (error) {
    console.error("=== PATCH ERROR ===");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      console.log("ValidationError detected");
      return Response.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }
    
    // Handle CastError
    if (error.name === 'CastError') {
      console.log("CastError detected");
      return Response.json(
        { error: "Invalid inform ID" },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  console.log("=== DELETE /api/informs/[id] START ===");
  
  await connectDB();
  console.log("1. Database connected");

  console.log("2. Verifying authentication...");
  let auth;
  try {
    auth = verifyToken(req);
    console.log("3. Auth successful:", { id: auth.id, role: auth.role });
  } catch (error) {
    console.error("3. Auth ERROR:", error.message);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins can delete
  if (auth.role !== "admin") {
    console.log("4. Non-admin attempted deletion - role:", auth.role);
    return Response.json(
      { error: "Only admins can delete informs" },
      { status: 403 }
    );
  }
  console.log("4. User is admin, proceeding...");

  try {
    console.log("5. Getting params...");
    
    // FIX: params is a Promise, so we need to await it
    const resolvedParams = await params;
    console.log("6. Resolved params:", resolvedParams);
    
    const { id } = resolvedParams;
    console.log("7. Extracted ID:", id);
    
    // Validate ID
    if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("8. ID validation FAILED");
      return Response.json(
        { error: "Invalid inform ID format" },
        { status: 400 }
      );
    }
    console.log("8. ID validation PASSED");

    console.log("9. Finding inform in database...");
    const inform = await Inform.findById(id);
    
    if (!inform) {
      console.log("10. Inform NOT FOUND");
      return Response.json({ error: "Inform not found" }, { status: 404 });
    }
    
    console.log("10. Inform found:", {
      _id: inform._id,
      title: inform.title
    });

    console.log("11. Deleting inform...");
    await Inform.findByIdAndDelete(id);
    console.log("12. Inform deleted successfully");

    console.log("=== DELETE /api/informs/[id] END ===");
    return Response.json({
      success: true,
      message: "Inform deleted successfully"
    });
  } catch (error) {
    console.error("=== DELETE ERROR ===");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Handle CastError
    if (error.name === 'CastError') {
      console.log("CastError detected");
      return Response.json(
        { error: "Invalid inform ID" },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}