
import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Wallet,
  IndianRupee,
  UserRound,
  Mail,
  LogOut,
  Target,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/types/profile";
import MontraLogo from "../../assets/montra-logo.png";
import userLogo from "../../assets/user.png";

import { useAxios } from "@/hooks/useAxios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthResponse {
  status: boolean;
}


interface ProfileResponse {
  status: boolean;
  data: Profile;
  message?: string;
}

interface LogoutResponse {
  status: boolean;
  message?: string;
}

export default function Layout() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const {
    request: checkAuthRequest,
  } = useAxios<AuthResponse>();

  const {
    request: profileRequest,
    loading: profileLoading,
  } = useAxios<ProfileResponse>();

  const {
    request: logoutRequest,
    loading: logoutLoading,
  } = useAxios<LogoutResponse>();

  const refreshProfile = useCallback(async () => {
    try {
      const response = await profileRequest({
        method: "GET",
        url: "/api/auth/profile",
      });

      if (response?.status && response.data) {
        setProfile(response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error("Unable to refresh profile:", error);
      throw error;
    }
  }, [profileRequest]);

  // Check authentication when the layout mounts.
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await checkAuthRequest({
          method: "GET",
          url: "/api/auth/check-auth",
        });

        if (!isMounted) return;

        if (response?.status === true) {
          setIsAuthenticated(true);
          await refreshProfile();
        } else {
          navigate("/auth/login", { replace: true });
        }
      } catch (error: unknown) {
        if (!isMounted) return;

        const status = (
          error as {
            response?: { status?: number };
          }
        )?.response?.status;

        if (status === 401) {
          navigate("/auth/login", { replace: true });
        } else {
          console.error("Authentication check failed:", error);
          toast.error("Unable to verify authentication.");
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthRequest, navigate, refreshProfile]);



  // Fetch the profile when the user clicks the profile icon.
  const handleProfileOpen = useCallback(async () => {
    setProfileOpen(true);

    try {
      await refreshProfile();
    } catch {
      toast.error("Unable to load profile.");
    }
  }, [refreshProfile]);

  // Log out and redirect after successful logout.
  const handleLogout = async () => {
    try {
      const response = await logoutRequest({
        method: "GET",
        url: "/api/auth/logout",
      });

      if (response?.status === true) {
        setProfileOpen(false);
        setIsAuthenticated(false);

        toast.success(
          response.message || "Logged out successfully."
        );

        navigate("/auth/login", { replace: true });
      } else {
        toast.error(response?.message || "Logout failed.");
      }
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          status?: number;
          data?: {
            detail?: string;
            message?: string;
          };
        };
      };

      if (apiError.response?.status === 401) {
        setProfileOpen(false);
        navigate("/auth/login", { replace: true });
        return;
      }

      toast.error(
        apiError.response?.data?.detail ||
        apiError.response?.data?.message ||
        "Unable to log out. Please try again."
      );
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoaderCircle className="size-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <>
      <div className="mx-auto min-h-screen w-full bg-white p-6 lg:w-1/2">
        <nav className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Go to home"
          >
            <img
              src={MontraLogo}
              alt="Montra"
              className="h-auto w-40 cursor-pointer"
            />
          </button>

          <div className="flex items-center">
            <Wallet
              className="mt-1"
              size={23}
              strokeWidth={3}
            />

            <span className="ms-3" />

            <IndianRupee
              className="mt-1"
              size={20}
              strokeWidth={3}
            />

            <span className="mt-1 text-2xl font-bold">
              {formatCurrency(profile?.wallet_balance ?? 0)}
            </span>

            <span className="ms-5" />

            <span className="h-7 w-px bg-[#c9c9c9]" />

            <span className="ms-5" />

            <button
              type="button"
              onClick={() => void handleProfileOpen()}
              aria-label="Open profile"
              className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-black"
            >
              <img
                src={userLogo}
                alt="User profile"
                className="h-auto w-8 cursor-pointer rounded-full"
              />
            </button>
          </div>
        </nav>

        <div className="space-y-10 pt-10">
          <Outlet context={{ refreshProfile }} />
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
            <DialogDescription>
              View your account information and savings target.
            </DialogDescription>
          </DialogHeader>

          {profileLoading || !profile ? (
            <div className="flex min-h-40 items-center justify-center">
              <LoaderCircle className="size-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-gray-100">
                  <UserRound className="size-7 text-gray-700" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Email address
                    </p>
                    <p className="break-all text-sm font-medium">
                      {profile.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Wallet className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Wallet balance
                    </p>
                    <p className="text-sm font-semibold">
                      ₹{formatCurrency(profile.wallet_balance)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Monthly savings target
                    </p>
                    <p className="text-sm font-semibold">
                      ₹{formatCurrency(profile.target_saving_monthly)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                className="w-full cursor-pointer"
                onClick={() => void handleLogout()}
                disabled={logoutLoading}
              >
                {logoutLoading ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 size-4" />
                )}

                {logoutLoading ? "Logging out..." : "Logout"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
