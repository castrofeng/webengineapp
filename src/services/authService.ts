import { LoginResponse } from "@/src/types/auth";

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {

  const response = await fetch(
    "https://api.seusistema.com/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    }
  );

  return response.json();
}