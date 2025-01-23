import React, {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AuthContextType {
  isLogged: boolean;
  isLoading: boolean;
  handleLogin: (token: string) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = Cookies.get("userAccessToken");
    setIsLogged(!!token);
    setIsLoading(false);
  }, []);

  const handleLogin = (token: string) => {
    Cookies.set("userAccessToken", token, { expires: 7 });
    setIsLogged(true);
  };

  const handleLogout = () => {
    Cookies.remove("userAccessToken");
    setIsLogged(false);
    router.push("/", undefined);
    console.log("Successfully logged out.");
  };

  return (
    <AuthContext.Provider
      value={{ isLogged, isLoading, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("error: need AuthProvider enroll (in layout)");
  }
  return context;
};
