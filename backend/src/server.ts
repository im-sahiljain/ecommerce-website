import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db";
import {
  requireCustomerAuth,
  requireAdminAuth,
  generateUserToken,
  generateAdminToken,
  AuthenticatedRequest,
} from "./middleware/auth";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteProductFolderFromCloudinary,
} from "./utils/cloudinary";
import { redisCacheMiddleware } from "./middleware/redisCache";
import { orderQueue } from "./queues/orderQueue";
import { initOrderWorker } from "./queues/orderWorker";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

dotenv.config();

// Initialize BullMQ worker process
initOrderWorker();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin@littlecreators.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";

app.set("etag", false); // Disable 304 ETag caching so API routes return fresh 200 OK
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Swagger UI API Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Admin Authentication API Endpoints (Database Verified)
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Admin username/email and password are required." });
  }

  const adminUser = await db.getAdminUserFromDatabase(username);
  if (!adminUser) {
    return res
      .status(401)
      .json({
        error: "Invalid admin credentials or account not found in database.",
      });
  }

  if (adminUser.password !== password) {
    return res
      .status(401)
      .json({ error: "Invalid admin password. Access denied." });
  }

  const token = generateAdminToken({
    username: adminUser.email || adminUser.identifier,
  });
  return res.json({
    success: true,
    token,
    admin: {
      username: adminUser.email || adminUser.identifier,
      name: adminUser.name || "Admin User",
      role: "admin",
    },
  });
});

app.get("/api/admin/me", requireAdminAuth, (req, res) => {
  res.json({ admin: (req as any).admin });
});

// Auth / Login Route
app.post("/api/users/login", (req, res) => {
  const { identifier, name, password } = req.body;
  if (!identifier) {
    return res
      .status(400)
      .json({ error: "Email or phone number is required." });
  }

  const user = db.findOrCreateUser(identifier, name, password);
  const token = generateUserToken({
    id: user.id,
    identifier: user.identifier,
    name: user.name,
  });

  const { password: _, ...userProfile } = user;
  res.json({
    success: true,
    user: userProfile,
    token,
  });
});

app.post("/api/users/signup", (req, res) => {
  const { identifier, name, password } = req.body;
  if (!identifier) {
    return res
      .status(400)
      .json({ error: "Email or phone number is required." });
  }

  const user = db.findOrCreateUser(identifier, name, password);
  const token = generateUserToken({
    id: user.id,
    identifier: user.identifier,
    name: user.name,
  });

  res.json({
    success: true,
    user,
    token,
  });
});

// Get User Profile (Protected)
app.get(
  "/api/users/profile",
  requireCustomerAuth,
  (req: AuthenticatedRequest, res) => {
    const userIdentifier = req.user?.identifier;
    if (!userIdentifier) return res.status(401).json({ error: "Unauthorized" });

    const user = db.getUserByIdentifier(userIdentifier);
    if (!user) return res.status(404).json({ error: "User profile not found" });

    // Exclude password from response
    const { password, ...profile } = user;
    res.json(profile);
  },
);

// Update User Profile & Address (Protected)
app.put(
  "/api/users/profile",
  requireCustomerAuth,
  (req: AuthenticatedRequest, res) => {
    const userIdentifier = req.user?.identifier;
    if (!userIdentifier) return res.status(401).json({ error: "Unauthorized" });

    const updatedUser = db.updateUserProfile(userIdentifier, req.body);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const { password, ...profile } = updatedUser;
    res.json({
      success: true,
      message: "Profile and delivery address updated successfully",
      user: profile,
    });
  },
);

// User Addresses API Endpoints (Protected)
app.get(
  "/api/users/addresses",
  requireCustomerAuth,
  (req: AuthenticatedRequest, res) => {
    const userIdentifier = req.user?.identifier;
    if (!userIdentifier) return res.status(401).json({ error: "Unauthorized" });

    const addresses = db.getUserAddresses(userIdentifier);
    res.json(addresses);
  },
);

app.post(
  "/api/users/addresses",
  requireCustomerAuth,
  (req: AuthenticatedRequest, res) => {
    const userIdentifier = req.user?.identifier;
    if (!userIdentifier) return res.status(401).json({ error: "Unauthorized" });

    const {
      label,
      fullName,
      phone,
      addressLine,
      city,
      state,
      zipCode,
      isDefault,
    } = req.body;
    if (!addressLine || !city || !state || !zipCode) {
      return res
        .status(400)
        .json({
          error:
            "Please provide full address details (street, city, state, zip code).",
        });
    }

    const newAddress = db.addUserAddress(userIdentifier, {
      label: label || "Home",
      fullName: fullName || req.user?.name || "",
      phone: phone || "",
      addressLine,
      city,
      state,
      zipCode,
      isDefault: Boolean(isDefault),
    });

    res.status(201).json(newAddress);
  },
);

app.put(
  "/api/users/addresses/:id/default",
  requireCustomerAuth,
  (req: AuthenticatedRequest, res) => {
    const userIdentifier = req.user?.identifier;
    if (!userIdentifier) return res.status(401).json({ error: "Unauthorized" });

    const success = db.setDefaultAddress(userIdentifier, req.params.id);
    if (!success) return res.status(404).json({ error: "Address not found" });

    res.json({ success: true, message: "Default address updated" });
  },
);

app.delete(
  "/api/users/addresses/:id",
  requireCustomerAuth,
  (req: AuthenticatedRequest, res) => {
    const userIdentifier = req.user?.identifier;
    if (!userIdentifier) return res.status(401).json({ error: "Unauthorized" });

    const success = db.deleteUserAddress(userIdentifier, req.params.id);
    if (!success) return res.status(404).json({ error: "Address not found" });

    res.json({ success: true, message: "Address deleted" });
  },
);

// Image Upload API (Cloudinary integration - Admin Protected)
app.post("/api/upload", requireAdminAuth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image)
      return res.status(400).json({ error: "Image data or URL required" });
    const imageUrl = await uploadToCloudinary(image);
    res.json({ url: imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Image upload failed" });
  }
});

// Product Lines API
app.get("/api/product-lines", (req, res) => {
  res.json(db.getProductLines());
});

app.post("/api/product-lines", requireAdminAuth, (req, res) => {
  const { name, slug, description, coverImage, icon, isVisible, sortOrder } =
    req.body;
  if (!name)
    return res.status(400).json({ error: "Product line name is required" });
  const newLine = db.addProductLine({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
    description,
    coverImage,
    icon: icon || "📦",
    isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
    sortOrder: Number(sortOrder || 0),
  });
  res.status(201).json(newLine);
});

app.put("/api/product-lines/:id", requireAdminAuth, (req, res) => {
  const updated = db.updateProductLine(req.params.id, req.body);
  if (!updated)
    return res.status(404).json({ error: "Product line not found" });
  res.json(updated);
});

app.delete("/api/product-lines/:id", requireAdminAuth, (req, res) => {
  const deleted = db.deleteProductLine(req.params.id);
  if (!deleted)
    return res.status(404).json({ error: "Product line not found" });
  res.json({ success: true });
});

// Category Facets API
app.get("/api/facets", (req, res) => {
  res.json(db.getFacets());
});

app.post("/api/facets", requireAdminAuth, (req, res) => {
  const {
    name,
    slug,
    parentId,
    productLineId,
    facetGroup,
    coverImage,
    icon,
    description,
    seoTitle,
    seoDescription,
    isVisible,
    sortOrder,
  } = req.body;
  if (!name) return res.status(400).json({ error: "Facet name is required" });
  const newFacet = db.addFacet({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
    parentId,
    productLineId,
    facetGroup: facetGroup || "General",
    coverImage,
    icon,
    description,
    seoTitle,
    seoDescription,
    isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
    sortOrder: Number(sortOrder || 0),
  });
  res.status(201).json(newFacet);
});

app.put("/api/facets/:id", requireAdminAuth, (req, res) => {
  const updated = db.updateFacet(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Facet not found" });
  res.json(updated);
});

app.delete("/api/facets/:id", requireAdminAuth, (req, res) => {
  const deleted = db.deleteFacet(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Facet not found" });
  res.json({ success: true });
});

// Bundle Rules API
app.get("/api/bundles", (req, res) => {
  res.json(db.getBundleRules());
});

app.post("/api/bundles", requireAdminAuth, (req, res) => {
  const { name, applicableScope, scopeValue, tiers, isActive, priority } =
    req.body;
  if (!name || !tiers || !Array.isArray(tiers)) {
    return res
      .status(400)
      .json({ error: "Bundle name and discount tiers are required." });
  }
  const newRule = db.addBundleRule({
    name,
    applicableScope: applicableScope || "all",
    scopeValue,
    tiers,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    priority: Number(priority || 0),
  });
  res.status(201).json(newRule);
});

app.put("/api/bundles/:id", requireAdminAuth, (req, res) => {
  const updated = db.updateBundleRule(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Bundle rule not found" });
  res.json(updated);
});

app.delete("/api/bundles/:id", requireAdminAuth, (req, res) => {
  const deleted = db.deleteBundleRule(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Bundle rule not found" });
  res.json({ success: true });
});

// Site Settings API (Global Ordering & WhatsApp Switches)
app.get("/api/settings", (req, res) => {
  res.json(db.getSettings());
});

app.put("/api/settings", requireAdminAuth, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// Homepage Sections API
app.get("/api/homepage-sections", (req, res) => {
  res.json(db.getHomepageSections());
});

app.post("/api/homepage-sections", requireAdminAuth, (req, res) => {
  const {
    type,
    title,
    subtitle,
    bgColor,
    textColor,
    layoutTemplate,
    productLineId,
    categoryId,
    isVisible,
    sortOrder,
  } = req.body;
  if (!title)
    return res.status(400).json({ error: "Section title is required" });
  const newSection = db.addHomepageSection({
    type: type || "categoryShowcase",
    title,
    subtitle,
    bgColor,
    textColor,
    layoutTemplate: layoutTemplate || "grid",
    productLineId,
    categoryId,
    isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
    sortOrder: Number(sortOrder || 0),
  });
  res.status(201).json(newSection);
});

app.put("/api/homepage-sections/reorder", requireAdminAuth, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds))
    return res.status(400).json({ error: "orderedIds array required" });
  const updated = db.reorderHomepageSections(orderedIds);
  res.json(updated);
});

app.put("/api/homepage-sections/:id", requireAdminAuth, (req, res) => {
  const updated = db.updateHomepageSection(req.params.id, req.body);
  if (!updated)
    return res.status(404).json({ error: "Homepage section not found" });
  res.json(updated);
});

app.delete("/api/homepage-sections/:id", requireAdminAuth, (req, res) => {
  const deleted = db.deleteHomepageSection(req.params.id);
  if (!deleted)
    return res.status(404).json({ error: "Homepage section not found" });
  res.json({ success: true });
});

// Product Stock Adjustment & Analytics API
app.post("/api/products/:id/stock-adjustment", requireAdminAuth, (req, res) => {
  const { changeAmount, reason, updatedBy } = req.body;
  if (typeof changeAmount !== "number" || !reason) {
    return res
      .status(400)
      .json({
        error: "changeAmount (number) and reason (string) are required.",
      });
  }
  const updated = db.adjustProductStock(
    req.params.id,
    changeAmount,
    reason,
    updatedBy || "Admin",
  );
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json(updated);
});

app.get("/api/products/:id/stock-history", requireAdminAuth, (req, res) => {
  const logs = db.getStockLogs(req.params.id);
  res.json(logs);
});

app.post("/api/products/:id/like", (req, res) => {
  const { userIdentifier } = req.body;
  const result = db.likeProduct(req.params.id, userIdentifier || "guest");
  res.json(result);
});

app.get("/api/analytics/products", (req, res) => {
  res.json(db.getAllAnalytics());
});

// Products Routes (Optimized with O(1) Redis Caching Layer)
app.get("/api/products", redisCacheMiddleware(300), (req, res) => {
  const { theme, category, ageGroup, search } = req.query;
  let products = db.getProducts();

  if (theme && typeof theme === "string") {
    products = products.filter(
      (p) => p.theme.toLowerCase() === theme.toLowerCase(),
    );
  }
  if (category && typeof category === "string") {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
  }
  if (ageGroup && typeof ageGroup === "string") {
    products = products.filter(
      (p) => p.ageGroup.toLowerCase() === ageGroup.toLowerCase(),
    );
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }

  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  db.recordProductView(req.params.id);
  res.json(product);
});

// Cloudinary Image Upload API Endpoint with 2 MB size limit & folder structure
app.post("/api/upload", async (req, res) => {
  try {
    const { image, productName } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    // 2 MB Size Validation (2 * 1024 * 1024 bytes = 2,097,152 bytes)
    if (image.startsWith("data:image")) {
      const base64Content = image.includes(",") ? image.split(",")[1] : image;
      const sizeInBytes = Math.ceil((base64Content.length * 3) / 4);
      const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

      if (sizeInBytes > MAX_SIZE) {
        return res.status(400).json({ error: "File size exceeds 2 MB limit" });
      }
    }

    // Folder structure: Ecommerce -> Products -> (Product name)
    const sanitizedName = (productName || "General").trim();
    const folderPath = `Ecommerce/Products/${sanitizedName}`;

    const url = await uploadToCloudinary(image, folderPath);
    res.json({ success: true, url });
  } catch (err: any) {
    console.error("Upload API Error:", err);
    res.status(500).json({ error: err.message || "Failed to upload image" });
  }
});

app.post("/api/products", requireAdminAuth, async (req, res) => {
  const {
    name,
    price,
    originalPrice,
    theme,
    category,
    ageGroup,
    isNonToxic,
    image,
    images,
    description,
    inStock,
    featured,
  } = req.body;
  if (!name || !price || !theme || !category || !ageGroup) {
    return res.status(400).json({ error: "Missing required product fields" });
  }

  const folderPath = `Ecommerce/Products/${name.trim()}`;
  let processedImages: string[] = [];

  if (Array.isArray(images) && images.length > 0) {
    for (const img of images) {
      if (img.startsWith("data:image")) {
        const uploadedUrl = await uploadToCloudinary(img, folderPath);
        processedImages.push(uploadedUrl);
      } else {
        processedImages.push(img);
      }
    }
  } else if (image) {
    if (image.startsWith("data:image")) {
      const uploadedUrl = await uploadToCloudinary(image, folderPath);
      processedImages.push(uploadedUrl);
    } else {
      processedImages.push(image);
    }
  }

  if (processedImages.length === 0) {
    processedImages.push(
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500",
    );
  }

  const newProduct = db.addProduct({
    name,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    theme,
    category,
    ageGroup,
    isNonToxic: Boolean(isNonToxic),
    image: processedImages[0],
    images: processedImages,
    description: description || "",
    inStock: inStock !== undefined ? Boolean(inStock) : true,
    featured: Boolean(featured),
  });
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", requireAdminAuth, async (req, res) => {
  const existingProduct = db.getProductById(req.params.id);
  if (!existingProduct)
    return res.status(404).json({ error: "Product not found" });

  const oldImages: string[] = Array.from(
    new Set([
      ...(existingProduct.images || []),
      ...(existingProduct.image ? [existingProduct.image] : []),
    ]),
  );

  let updates = { ...req.body };
  const productName = updates.name || existingProduct.name || "General";
  const folderPath = `Ecommerce/Products/${productName.trim()}`;

  if (Array.isArray(updates.images)) {
    const uploadedList: string[] = [];
    for (const img of updates.images) {
      if (typeof img === "string" && img.startsWith("data:image")) {
        const uploadedUrl = await uploadToCloudinary(img, folderPath);
        uploadedList.push(uploadedUrl);
      } else {
        uploadedList.push(img);
      }
    }
    updates.images = uploadedList;
    if (uploadedList.length > 0) {
      updates.image = uploadedList[0];
    }

    // Delete any old Cloudinary images that were removed by admin during edit
    const removedImages = oldImages.filter(
      (oldUrl) => !uploadedList.includes(oldUrl),
    );
    for (const removedUrl of removedImages) {
      if (removedUrl && removedUrl.includes("cloudinary.com")) {
        await deleteFromCloudinary(removedUrl);
      }
    }
  } else if (updates.image && updates.image.startsWith("data:image")) {
    updates.image = await uploadToCloudinary(updates.image, folderPath);
    updates.images = [updates.image];

    // Delete old images if replaced by single new upload
    const removedImages = oldImages.filter(
      (oldUrl) => oldUrl !== updates.image,
    );
    for (const removedUrl of removedImages) {
      if (removedUrl && removedUrl.includes("cloudinary.com")) {
        await deleteFromCloudinary(removedUrl);
      }
    }
  }

  const updated = db.updateProduct(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json(updated);
});

app.delete("/api/products/:id", requireAdminAuth, async (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  // Delete all Cloudinary images and the dedicated product folder
  const imagesToDelete: string[] = Array.from(
    new Set([
      ...(product.images || []),
      ...(product.image ? [product.image] : []),
    ]),
  );

  await deleteProductFolderFromCloudinary(product.name, imagesToDelete);

  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: "Product not found" });
  res.json({
    success: true,
    message: "Product, images, and Cloudinary folder deleted successfully",
  });
});

// Categories Routes
app.get("/api/categories", (req, res) => {
  res.json(db.getCategories());
});

app.post("/api/categories", requireAdminAuth, (req, res) => {
  const { name, slug, description, productLineId } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const category = db.addCategory({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
    description,
    productLineId,
  });
  res.status(201).json(category);
});

app.put("/api/categories/:id", requireAdminAuth, (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Category not found" });
  res.json(updated);
});

app.delete("/api/categories/:id", requireAdminAuth, (req, res) => {
  db.deleteCategory(req.params.id);
  res.json({ success: true });
});

// Themes Routes
app.get("/api/themes", (req, res) => {
  res.json(db.getThemes());
});

app.post("/api/themes", requireAdminAuth, (req, res) => {
  const { name, slug, description, icon } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const theme = db.addTheme({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
    description,
    icon,
  });
  res.status(201).json(theme);
});

app.put("/api/themes/:id", requireAdminAuth, (req, res) => {
  const updated = db.updateTheme(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Theme not found" });
  res.json(updated);
});

app.delete("/api/themes/:id", requireAdminAuth, (req, res) => {
  db.deleteTheme(req.params.id);
  res.json({ success: true });
});

// Age Groups Routes
app.get("/api/age-groups", (req, res) => {
  res.json(db.getAgeGroups());
});

app.post("/api/age-groups", requireAdminAuth, (req, res) => {
  const { name, slug } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const group = db.addAgeGroup({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
  });
  res.status(201).json(group);
});

app.delete("/api/age-groups/:id", requireAdminAuth, (req, res) => {
  db.deleteAgeGroup(req.params.id);
  res.json({ success: true });
});

// Orders Routes (AUTHENTICATED FOR CUSTOMERS & ADMIN)
app.get(
  "/api/orders/my-orders",
  requireCustomerAuth,
  (req: AuthenticatedRequest, res) => {
    const userIdentifier = req.user?.identifier;
    if (!userIdentifier)
      return res.status(401).json({ error: "User session not found" });
    const userOrders = db.getOrdersByUser(userIdentifier);
    res.json(userOrders);
  },
);

app.get("/api/orders", requireAdminAuth, (req, res) => {
  const { userIdentifier } = req.query;
  if (userIdentifier && typeof userIdentifier === "string") {
    return res.json(db.getOrdersByUser(userIdentifier));
  }
  res.json(db.getOrders());
});

app.get("/api/orders/:id", (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.post("/api/orders", (req: AuthenticatedRequest, res) => {
  const {
    customerName,
    shippingAddress,
    phone,
    items,
    subtotal,
    shipping,
    total,
    userIdentifier: customIdentifier,
    status: customStatus,
    city,
    state,
    zipCode,
  } = req.body;

  // Extract optional auth user or use customIdentifier / phone
  let userIdentifier =
    req.user?.identifier ||
    customIdentifier ||
    phone ||
    "guest@littlecreators.com";

  if (!items || !items.length || !customerName || !shippingAddress) {
    return res
      .status(400)
      .json({ error: "Please fill in all order details." });
  }

  // 1. Auto-create user in database if not registered yet
  if (userIdentifier && userIdentifier !== "guest@littlecreators.com") {
    db.findOrCreateUser(userIdentifier, customerName);
    db.updateUserProfile(userIdentifier, {
      name: customerName,
      phone: phone || "",
      address: shippingAddress,
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
    });
  }

  // 2. Create Order in PostgreSQL
  const newOrder = db.createOrder({
    userIdentifier,
    customerName,
    shippingAddress,
    phone: phone || "",
    items,
    subtotal: Number(subtotal),
    shipping: Number(shipping || 0),
    total: Number(total),
    status: customStatus || "Pending",
  });

  // 3. Auto-save shipping address to user's saved addresses profile
  if (userIdentifier && userIdentifier !== "guest@littlecreators.com") {
    const existingAddresses = db.getUserAddresses(userIdentifier);
    const matchesExisting = existingAddresses.some(
      (a) => a.addressLine.toLowerCase() === shippingAddress.toLowerCase(),
    );

    if (!matchesExisting) {
      db.addUserAddress(userIdentifier, {
        label:
          existingAddresses.length === 0
            ? "Home"
            : `Address #${existingAddresses.length + 1}`,
        fullName: customerName,
        phone: phone || "",
        addressLine: shippingAddress,
        city: city || "",
        state: state || "",
        zipCode: zipCode || "",
        isDefault: existingAddresses.length === 0,
      });
    }
  }

  // Offload post-purchase processing (email/PDF/ERP) asynchronously to BullMQ queue worker
  orderQueue
    .add("process-post-purchase", {
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      customerEmail: newOrder.userIdentifier,
      items: newOrder.items,
      totalAmount: newOrder.total,
    })
    .catch((err: any) => {
      console.warn(
        "⚠️ BullMQ queue push failed (Queue offline):",
        err.message,
      );
    });

  res.status(201).json(newOrder);
});

app.patch("/api/orders/:id/status", requireAdminAuth, (req: any, res: any) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });
  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "Order not found" });
  res.json(updated);
});

// Admin Stats
app.get("/api/admin/stats", requireAdminAuth, (req: any, res: any) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;

  res.json({
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders,
    recentOrders: orders.slice(0, 5),
  });
});

const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Little Creators Backend listening on http://${HOST}:${PORT}`);
});
