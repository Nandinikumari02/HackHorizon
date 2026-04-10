import { RoleCard, roleConfig } from "./RoleCard";


export const RoleSelection = () => {

  const handleRoleClick = (role: string) => {

    if (role === "citizen") {
      window.location.href = "/login";
    }

    if (role === "staff") {
      window.location.href = "/login";
    }

    if (role === "admin") {
      window.location.href = "/login";
    }

    if (role === "super-admin") {
      window.location.href = "/login";
    }

  };

  return (
    <section id="roles" className="py-20 bg-background">
      <div className="container mx-auto px-6">

        <div className="text-center mb-16">
         

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your
            <span className="block text-primary">
              Role & Dashboard
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each role has a specialized interface designed for their unique needs and responsibilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(roleConfig).map(([role, config]) => (
            <RoleCard
              key={role}
              role={role as any}
              title={config.title}
              description={config.description}
              features={config.features}
              icon={config.icon}
              onClick={() => handleRoleClick(role)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};