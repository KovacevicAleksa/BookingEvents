import React from "react";
import Card from "../src/Components/Card";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Mock the useAuth hook
jest.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: { token: "mocked-token" },
  }),
}));

test("renders Card component with given props", () => {
  const props = {
    totalPeople: 5,
    date: "2024-08-15",
    price: "500 RSD",
    title: "React Conference",
    description: "Join us for an amazing React conference.",
    photo: "",
    location: "Belgrade",
    eventId: "1",
  };

  render(<Card {...props} />);

  // Check rendering
  expect(screen.getByText("React Conference")).toBeInTheDocument();
  expect(
    screen.getByText("Join us for an amazing React conference.")
  ).toBeInTheDocument();
  expect(screen.getByText("500 RSD")).toBeInTheDocument();
  expect(screen.getByText("Belgrade")).toBeInTheDocument();
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(screen.getByAltText("Conference")).toBeInTheDocument();
});
