import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const feedbacks = [
  {
    name: "Ravi Kumar",
    role: "Citizen",
    message:
      "This platform helped me report a pothole in my area and it was fixed within two days. The tracking feature is amazing!",
  },
  {
    name: "Anjali Singh",
    role: "Ground Staff",
    message:
      "The task dashboard makes it very easy to see assigned issues and update progress directly from the field.",
  },
  {
    name: "Rahul Verma",
    role: "Department Admin",
    message:
      "Managing complaints and assigning them to staff has become much faster with this system.",
  },
];

export default function Feedback() {
  return (
    <section className="py-20 bg-background">

      <div className="container mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            User Feedback
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Users Say About
            <span className="block text-primary">
              Our Platform
            </span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from citizens and government staff who are using the system
            to improve civic services.
          </p>
        </div>

        {/* Feedback Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          {feedbacks.map((item, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition">

              {/* Stars */}
              <div className="flex mb-3 text-yellow-500">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>

              {/* Message */}
              <p className="text-muted-foreground mb-4">
                "{item.message}"
              </p>

              {/* User */}
              <div>
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.role}
                </p>
              </div>

            </Card>
          ))}

        </div>

      </div>

    </section>
  );
}