import { authUser } from "../data/mockData";

export function useAuth() {
  return { user: authUser };
}
