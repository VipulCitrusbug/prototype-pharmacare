
import { apiRequest } from "../client/src/lib/queryClient"; 
// Can't easily use client lib in node script without polyfills. 
// Use fetch directly.

async function main() {
  const baseUrl = "http://localhost:5000"; // Assuming default port
  
  // 1. Signup/Login to get a session
  const username = "testuser_" + Date.now();
  const password = "password123";
  
  console.log("Creating user...");
  const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      email: `${username}@example.com`,
      firstName: "Test",
      lastName: "User",
      role: "patient"
    })
  });

  if (!signupRes.ok) {
    console.error("Signup failed:", await signupRes.text());
    return;
  }

  const cookie = signupRes.headers.get("set-cookie");
  console.log("User created. Cookie:", cookie);

  // 2. Update Profile
  console.log("Updating profile...");
  const updateRes = await fetch(`${baseUrl}/api/auth/me`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      "Cookie": cookie || ""
    },
    body: JSON.stringify({
      firstName: "Updated",
      lastName: "Name",
      phone: "555-999-0000"
    })
  });

  if (!updateRes.ok) {
    const text = await updateRes.text();
    console.error(`Update failed (${updateRes.status}):`, text);
    return;
  }

  const updatedUser = await updateRes.json();
  console.log("Update response:", updatedUser);

  if (updatedUser.firstName === "Updated" && updatedUser.phone === "555-999-0000") {
    console.log("SUCCESS: Profile updated correctly.");
  } else {
    console.error("FAILURE: Profile did not update correctly.");
  }
}

main().catch(console.error);
