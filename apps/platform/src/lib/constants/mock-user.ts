export interface MockUser {
  name: string;
  role: "manager" | "employee";
  directReports: { name: string; jobTitle: string }[];
}

export const MOCK_USER: MockUser = {
  name: "Jason",
  role: "manager",
  directReports: [
    { name: "Sarah Chen", jobTitle: "Senior Engineer" },
    { name: "Michael Torres", jobTitle: "Product Designer" },
    { name: "Emily Davis", jobTitle: "Marketing Manager" },
  ],
};
