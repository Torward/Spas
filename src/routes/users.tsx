import React from "react";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import UserManagement from "@/components/UserManagement";

const UsersPage = () => {
  const { isDispatcher } = useAuth();

  if (!isDispatcher) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-6">
      <UserManagement />
    </div>
  );
};

export default UsersPage;
