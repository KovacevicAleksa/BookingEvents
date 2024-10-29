import React from "react";
import Card from "../src/Components/Card"; // Importing the Card component to test
import "@testing-library/jest-dom"; // Importing custom matchers for Jest
import { render, screen } from "@testing-library/react"; // Importing render and screen utilities from Testing Library

// Mock the useAuth hook to provide a mocked user object
jest.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: { token: "mocked-token" }, // Mocked token for authentication
  }),
}));

// Test to verify if the Card component renders with the given props
test("renders Card component with given props", () => {
  // Define the props to be passed to the Card component
  const props = {
    attendees: "5 / 30",
    date: "2024-08-15",
    price: "500 RSD",
    title: "React Conference",
    description: "Join us for an amazing React conference.",
    photo: "",
    location: "Belgrade",
    eventId: "1",
  };

  // Render the Card component with the provided props
  render(<Card {...props} />);

  // Assertions to verify that the component renders the expected content
  expect(screen.getByText("React Conference")).toBeInTheDocument(); // Check title
  expect(
    screen.getByText("Join us for an amazing React conference.")
  ).toBeInTheDocument(); // Check description
  expect(screen.getByText("500 RSD")).toBeInTheDocument(); // Check price
  expect(screen.getByText("Belgrade")).toBeInTheDocument(); // Check location
  expect(screen.getByText("5 / 30")).toBeInTheDocument(); // Check totalPeople
  expect(screen.getByAltText("Conference")).toBeInTheDocument(); // Check alt text for image
});
