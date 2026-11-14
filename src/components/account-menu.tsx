"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PackageCheck,
  UserRound,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

export function AccountMenu({
  user,
}: {
  user: { name: string; role: string } | null;
}) {
  const router = useRouter();
  const isAdmin = user?.role === "admin";
  const initials = user?.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "G";

  async function signOut() {
    try {
      const result = await authClient.signOut();
      if (result.error) {
        console.error("Could not sign out:", result.error.message);
        toast.add({
          description: "Please try signing out again.",
          title: "We couldn't sign you out",
          type: "error",
        });
        return;
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Could not sign out:", error);
      toast.add({
        description: "Check your connection and try again.",
        title: "We couldn't sign you out",
        type: "error",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={user ? `Account menu for ${user.name}` : "Account menu"}
        className="profile-avatar-trigger"
      >
        <Avatar aria-hidden="true">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="account-menu-content" sideOffset={10}>
        {user ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="account-menu-label">
                <span>{user.name}</span>
                <small>YOUR LITTLE CORNER</small>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserRound />
              My profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/orders" />}>
              <PackageCheck />
              My orders
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/favorites" />}>
              <Heart />
              Favorites
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/support" />}>
              <MessageCircle />
              Customer support
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem render={<Link href="/admin" />}>
                <LayoutDashboard />
                Admin dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} variant="destructive">
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="account-menu-label">
                <span>Welcome to the shop</span>
                <small>SIGN IN TO SAVE YOUR FAVORITES</small>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/login" />}>
              <UserRound />
              Log in
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/signup" />}>
              Create an account
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
