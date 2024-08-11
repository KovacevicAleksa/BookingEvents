require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

describe("GET /view/events", () => {
  beforeAll(async () => {
    await mongoose.connection.close();

    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return a list of events including a specific event", async () => {
    const response = await request(app).get("/view/events");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Proverava specifičan event po ID-u
    const specificEvent = response.body.find(
      (event) => event._id === "66742d33db75db27afddda8a"
    );

    expect(specificEvent).toBeDefined();
    expect(specificEvent).toMatchObject({
      _id: "66742d33db75db27afddda8a",
      id: "66742d33db75db27afddda89",
      price: "30$",
      title: "Kripto konferencija u Jagodini",
      description: expect.any(String),
      location: "Jagodina, Serbia",
      maxPeople: 90,
      totalPeople: 71,
      date: expect.any(String),
    });

    // Provera datuma
    const eventDate = new Date(specificEvent.date);
    expect(eventDate.getFullYear()).toBe(2027);
    expect(eventDate.getMonth()).toBe(4); // Maj je 4 (0-indexed)
    expect(eventDate.getDate()).toBe(11);

    // Provera createdAt i updatedAt
    expect(specificEvent.createdAt).toBeDefined();
    expect(specificEvent.updatedAt).toBeDefined();
  });
});
