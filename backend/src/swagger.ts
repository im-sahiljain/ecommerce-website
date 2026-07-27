import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Craft and Kit Craft Hub API",
      version: "1.0.0",
      description:
        "Production REST API for Craft and Kit Craft Hub featuring Supabase PostgreSQL, Redis Caching, BullMQ Order Queueing, and Auth.",
      contact: {
        name: "Craft and Kit Engineering",
        email: "support@littlecreators.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "prod-1" },
            name: { type: "string", example: "Space Rocket Painting Kit" },
            price: { type: "number", example: 29.99 },
            originalPrice: { type: "number", example: 34.99 },
            theme: { type: "string", example: "Space" },
            category: { type: "string", example: "Painting" },
            ageGroup: { type: "string", example: "5-8" },
            isNonToxic: { type: "boolean", example: true },
            image: {
              type: "string",
              example:
                "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
            },
            description: {
              type: "string",
              example: "Eco-friendly paint kit for young space explorers.",
            },
            inStock: { type: "boolean", example: true },
            featured: { type: "boolean", example: true },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "usr-123" },
            identifier: { type: "string", example: "customer@example.com" },
            name: { type: "string", example: "Jane Doe" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string", example: "ord-1" },
            userIdentifier: { type: "string", example: "customer@example.com" },
            customerName: { type: "string", example: "Jane Doe" },
            shippingAddress: {
              type: "string",
              example: "123 Main St, San Francisco, CA",
            },
            phone: { type: "string", example: "+15551234567" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string", example: "prod-1" },
                  productName: {
                    type: "string",
                    example: "Space Rocket Painting Kit",
                  },
                  price: { type: "number", example: 29.99 },
                  quantity: { type: "integer", example: 1 },
                  image: {
                    type: "string",
                    example:
                      "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
                  },
                },
              },
            },
            subtotal: { type: "number", example: 29.99 },
            shipping: { type: "number", example: 0 },
            total: { type: "number", example: 29.99 },
            status: {
              type: "string",
              example: "Pending",
              enum: ["Pending", "Processing", "Shipped", "Delivered"],
            },
            createdAt: { type: "string", example: "2026-07-25T16:00:00.000Z" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", example: "cat-1" },
            name: { type: "string", example: "Painting" },
            slug: { type: "string", example: "painting" },
            description: {
              type: "string",
              example: "Washable painting craft kits",
            },
          },
        },
        Theme: {
          type: "object",
          properties: {
            id: { type: "string", example: "thm-1" },
            name: { type: "string", example: "Space" },
            slug: { type: "string", example: "space" },
            description: {
              type: "string",
              example: "Outer space adventure crafts",
            },
          },
        },
        AgeGroup: {
          type: "object",
          properties: {
            id: { type: "string", example: "ag-1" },
            name: { type: "string", example: "3-5 Years" },
            slug: { type: "string", example: "3-5-years" },
          },
        },
      },
    },
    paths: {
      "/api/users/login": {
        post: {
          summary: "Customer / User Login",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["identifier"],
                  properties: {
                    identifier: { type: "string", example: "user@example.com" },
                    name: { type: "string", example: "Jane" },
                    password: { type: "string", example: "secret" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful with JWT token" },
            400: { description: "Missing required identifier" },
          },
        },
      },
      "/api/users/signup": {
        post: {
          summary: "Customer / User Registration",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["identifier"],
                  properties: {
                    identifier: { type: "string", example: "user@example.com" },
                    name: { type: "string", example: "Jane" },
                    password: { type: "string", example: "secret" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "User created successfully with JWT token" },
          },
        },
      },
      "/api/products": {
        get: {
          summary: "Get Products Catalog (O(1) Redis Cached)",
          tags: ["Products"],
          parameters: [
            { in: "query", name: "theme", schema: { type: "string" } },
            { in: "query", name: "category", schema: { type: "string" } },
            { in: "query", name: "ageGroup", schema: { type: "string" } },
            { in: "query", name: "search", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Array of products",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create New Product",
          tags: ["Products"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          responses: {
            201: { description: "Product created" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          summary: "Get Product Details by ID",
          tags: ["Products"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Product object" },
            404: { description: "Product not found" },
          },
        },
        put: {
          summary: "Update Product",
          tags: ["Products"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Product updated" } },
        },
        delete: {
          summary: "Delete Product",
          tags: ["Products"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Product deleted" } },
        },
      },
      "/api/categories": {
        get: {
          summary: "Get Categories List",
          tags: ["Categories"],
          responses: { 200: { description: "List of categories" } },
        },
        post: {
          summary: "Add Category",
          tags: ["Categories"],
          responses: { 201: { description: "Category created" } },
        },
      },
      "/api/themes": {
        get: {
          summary: "Get Themes List",
          tags: ["Themes"],
          responses: { 200: { description: "List of themes" } },
        },
        post: {
          summary: "Add Theme",
          tags: ["Themes"],
          responses: { 201: { description: "Theme created" } },
        },
      },
      "/api/age-groups": {
        get: {
          summary: "Get Age Groups List",
          tags: ["Age Groups"],
          responses: { 200: { description: "List of age groups" } },
        },
        post: {
          summary: "Add Age Group",
          tags: ["Age Groups"],
          responses: { 201: { description: "Age group created" } },
        },
      },
      "/api/orders/my-orders": {
        get: {
          summary: "Get Authenticated Customer Orders",
          tags: ["Orders"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "User orders array" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/orders": {
        get: {
          summary: "Get Orders (Admin / Search)",
          tags: ["Orders"],
          responses: { 200: { description: "Orders list" } },
        },
        post: {
          summary: "Place Order (Dispatches BullMQ Async Worker Job)",
          tags: ["Orders"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Order" },
              },
            },
          },
          responses: {
            201: { description: "Order created and queued asynchronously" },
          },
        },
      },
      "/api/orders/{id}/status": {
        patch: {
          summary: "Update Order Delivery Status",
          tags: ["Orders"],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string" } },
                },
              },
            },
          },
          responses: { 200: { description: "Order status updated" } },
        },
      },
      "/api/admin/stats": {
        get: {
          summary: "Get Admin Dashboard Statistics",
          tags: ["Admin"],
          responses: { 200: { description: "Dashboard stats analytics" } },
        },
      },
    },
  },
  apis: ["./src/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
