import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Shield, Settings, Crown } from "lucide-react";

interface RoleCardProps {
  role: "citizen" | "staff" | "admin" | "super-admin";
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  onClick: () => void;
}

export const RoleCard = ({
  role,
  title,
  description,
  features,
  icon,
  onClick,
}: RoleCardProps) => {

  const getRoleStyle = () => {
    if (role === "staff" || role === "super-admin") {
      return "bg-green-50 border-green-300 hover:border-green-500";
    }
    return "bg-white border-gray-200 hover:border-gray-400";
  };

  const getIconStyle = () => {
    if (role === "staff" || role === "super-admin") {
      return "bg-green-100 text-green-600";
    }
    return "bg-gray-100 text-gray-700";
  };

  return (
    <Card
      className={`p-6 border transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${getRoleStyle()}`}
      onClick={onClick}
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-4">

        <div className={`p-3 rounded-lg ${getIconStyle()}`}>
          {icon}
        </div>

        <Badge variant="secondary" className="capitalize">
          {role.replace("-", " ")}
        </Badge>

      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground mb-4">
        {description}
      </p>

      {/* Features */}
      <div className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center text-sm text-muted-foreground"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
            {feature}
          </div>
        ))}
      </div>

      {/* Button */}
      <Button className="w-full group">
        Access Dashboard
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>

    </Card>
  );
};

export const roleConfig = {
  citizen: {
    title: "Citizen Portal",
    description:
      "Report civic issues, track progress, and earn rewards for community contributions.",
    features: [
      "Report issues with photos & GPS",
      "Track resolution progress",
      "View community issues map",
      "Earn government rewards",
      "Redeem points for benefits",
    ],
    icon: <Users className="h-6 w-6" />,
  },

  staff: {
    title: "Ground Staff App",
    description:
      "Field workers can view assigned tasks, update progress, and resolve civic issues.",
    features: [
      "View assigned tasks on map",
      "Update issue progress",
      "Upload resolution proof",
      "Priority-based task list",
      "Real-time status updates",
    ],
    icon: <Shield className="h-6 w-6" />,
  },

  admin: {
    title: "Department Admin",
    description:
      "Manage departmental issues, assign tasks to staff, and approve citizen rewards.",
    features: [
      "Issue assignment & routing",
      "Staff task management",
      "Add Staff Members",
      "Department analytics",
      "Performance monitoring",
    ],
    icon: <Settings className="h-6 w-6" />,
  },

  "super-admin": {
    title: "Super Admin",
    description:
      "City-wide oversight, cross-department coordination, and system administration.",
    features: [
      "City-wide issue monitoring",
      "Department performance",
      "Staff & role management",
      "Analytics & reporting",
      "Issue escalation",
    ],
    icon: <Crown className="h-6 w-6" />,
  },
};