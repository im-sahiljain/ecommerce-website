import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';
import { requireCustomerAuth, generateUserToken, AuthenticatedRequest } from './middleware/auth';
import { uploadToCloudinary } from './utils/cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth / Login Route
app.post('/api/users/login', (req, res) => {
  const { identifier, name, password } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  const user = db.findOrCreateUser(identifier, name, password);
  const token = generateUserToken({ id: user.id, identifier: user.identifier, name: user.name });

  res.json({
    success: true,
    user: { id: user.id, identifier: user.identifier, name: user.name },
    token
  });
});

app.post('/api/users/signup', (req, res) => {
  const { identifier, name, password } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  const user = db.findOrCreateUser(identifier, name, password);
  const token = generateUserToken({ id: user.id, identifier: user.identifier, name: user.name });

  res.json({
    success: true,
    user: { id: user.id, identifier: user.identifier, name: user.name },
    token
  });
});

// Image Upload API (Cloudinary integration)
app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image data or URL required' });
    const imageUrl = await uploadToCloudinary(image);
    res.json({ url: imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

// Products Routes
app.get('/api/products', (req, res) => {
  const { theme, category, ageGroup, search } = req.query;
  let products = db.getProducts();

  if (theme && typeof theme === 'string') {
    products = products.filter(p => p.theme.toLowerCase() === theme.toLowerCase());
  }
  if (category && typeof category === 'string') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (ageGroup && typeof ageGroup === 'string') {
    products = products.filter(p => p.ageGroup.toLowerCase() === ageGroup.toLowerCase());
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', async (req, res) => {
  const { name, price, originalPrice, theme, category, ageGroup, isNonToxic, image, description, inStock, featured } = req.body;
  if (!name || !price || !theme || !category || !ageGroup) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }

  let finalImage = image || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500';
  if (image && image.startsWith('data:image')) {
    finalImage = await uploadToCloudinary(image);
  }

  const newProduct = db.addProduct({
    name,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    theme,
    category,
    ageGroup,
    isNonToxic: Boolean(isNonToxic),
    image: finalImage,
    description: description || '',
    inStock: inStock !== undefined ? Boolean(inStock) : true,
    featured: Boolean(featured)
  });
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  let updates = { ...req.body };
  if (updates.image && updates.image.startsWith('data:image')) {
    updates.image = await uploadToCloudinary(updates.image);
  }
  const updated = db.updateProduct(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

app.delete('/api/products/:id', (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
});

// Categories Routes
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});

app.post('/api/categories', (req, res) => {
  const { name, slug, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const category = db.addCategory({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description });
  res.status(201).json(category);
});

app.put('/api/categories/:id', (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

app.delete('/api/categories/:id', (req, res) => {
  db.deleteCategory(req.params.id);
  res.json({ success: true });
});

// Themes Routes
app.get('/api/themes', (req, res) => {
  res.json(db.getThemes());
});

app.post('/api/themes', (req, res) => {
  const { name, slug, description, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const theme = db.addTheme({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description, icon });
  res.status(201).json(theme);
});

app.put('/api/themes/:id', (req, res) => {
  const updated = db.updateTheme(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Theme not found' });
  res.json(updated);
});

app.delete('/api/themes/:id', (req, res) => {
  db.deleteTheme(req.params.id);
  res.json({ success: true });
});

// Age Groups Routes
app.get('/api/age-groups', (req, res) => {
  res.json(db.getAgeGroups());
});

app.post('/api/age-groups', (req, res) => {
  const { name, slug } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const group = db.addAgeGroup({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-') });
  res.status(201).json(group);
});

app.delete('/api/age-groups/:id', (req, res) => {
  db.deleteAgeGroup(req.params.id);
  res.json({ success: true });
});

// Orders Routes (AUTHENTICATED FOR CUSTOMERS)
app.get('/api/orders/my-orders', requireCustomerAuth, (req: AuthenticatedRequest, res) => {
  const userIdentifier = req.user?.identifier;
  if (!userIdentifier) return res.status(401).json({ error: 'User session not found' });
  const userOrders = db.getOrdersByUser(userIdentifier);
  res.json(userOrders);
});

app.get('/api/orders', (req, res) => {
  const { userIdentifier } = req.query;
  if (userIdentifier && typeof userIdentifier === 'string') {
    return res.json(db.getOrdersByUser(userIdentifier));
  }
  res.json(db.getOrders());
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.post('/api/orders', requireCustomerAuth, (req: AuthenticatedRequest, res) => {
  const { customerName, shippingAddress, phone, items, subtotal, shipping, total } = req.body;
  const userIdentifier = req.user?.identifier;

  if (!items || !items.length || !customerName || !shippingAddress) {
    return res.status(400).json({ error: 'Please fill in all order details.' });
  }

  const newOrder = db.createOrder({
    userIdentifier: userIdentifier || 'guest@littlecreators.com',
    customerName,
    shippingAddress,
    phone: phone || '',
    items,
    subtotal: Number(subtotal),
    shipping: Number(shipping || 0),
    total: Number(total)
  });

  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  res.json({
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders,
    recentOrders: orders.slice(0, 5)
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Little Creators Backend listening on http://localhost:${PORT}`);
});
